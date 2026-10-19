// Checkout events require the current authenticated session, UUID and attempt.
export const CHECKOUT_OPEN = "CHECKOUT_OPEN";
export const CHECKOUT_ATTEMPT = "CHECKOUT_ATTEMPT";
export const CHECKOUT_FAILED = "CHECKOUT_FAILED";
export const CHECKOUT_CONFIRMED = "CHECKOUT_CONFIRMED";
export const CHECKOUT_DISMISS_RESULT = "CHECKOUT_DISMISS_RESULT";
export const accountKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
export const checkoutBusy = (intent) =>
  ["SUBMITTING", "RECONCILING"].includes(intent?.status);
export function sameCheckoutSession(state, scope) {
  return (
    Boolean(scope?.account) &&
    accountKey(state.client.user?.email) === scope.account &&
    state.client.sessionRevision === scope.revision
  );
}
export function ownsCheckout(state, scope, attempt) {
  const intent = state.shoppingCart.orderIntent;
  return (
    sameCheckoutSession(state, scope) &&
    intent?.scope?.account === scope.account &&
    intent.scope.revision === scope.revision &&
    intent.payload.request_id === scope.requestId &&
    (attempt === undefined || intent.attempt === attempt)
  );
}
export function expiredInventory(product) {
  return {
    ...product,
    inventoryRevision: product.inventoryRevision + 1,
    fetchState: "NOT_FETCHED",
    lastSuccessfulQueryKey: "",
    activeListRequestId: null,
    productList: [],
    total: 0,
    productListError: null,
    selectedProduct: {},
    selectedProductFetchState: "NOT_FETCHED",
    activeDetailRequestId: null,
    selectedProductError: null,
  };
}
export function checkoutFailure(intent, error) {
  if (error.code === "ORDER_REQUEST_CONFLICT")
    return {
      status: "UNRESOLVED",
      uncertain: true,
      error:
        "This request identity conflicts with a recorded purchase. Check Previous Orders and resolve the original purchase before another checkout.",
    };
  if ([401, 403].includes(error.status))
    return {
      status: "AUTH_REQUIRED",
      uncertain: intent.uncertain,
      error:
        "Sign in to the original account to reconcile this purchase with its retained request identity. Its outcome has not been established.",
    };
  if (!error.status || error.status >= 500 || [408, 429].includes(error.status))
    return {
      status: "INDETERMINATE",
      uncertain: true,
      error:
        "Order outcome is uncertain. Retry the same order safely or check Previous Orders. Do not start another purchase while this one is unresolved.",
    };
  if (intent.uncertain)
    return {
      status: "UNRESOLVED",
      uncertain: true,
      error:
        "This retry was rejected, but the earlier purchase may already exist. Check Previous Orders; the original request identity is retained for reconciliation.",
    };
  return {
    status: "REJECTED",
    uncertain: false,
    error: error.message || "Order was rejected before commit.",
  };
}
export function reduceCheckout(state, action) {
  const { scope, intent, attempt } = action.payload || {};
  if (action.type === CHECKOUT_DISMISS_RESULT) {
    const result = state.shoppingCart.checkoutResult;
    if (
      !sameCheckoutSession(state, scope) ||
      state.shoppingCart.orderIntent ||
      result?.scope.requestId !== scope.requestId
    )
      return state;
    return {
      ...state,
      shoppingCart: {
        ...state.shoppingCart,
        checkoutResult: { ...result, visible: false },
      },
    };
  }
  if (action.type === CHECKOUT_OPEN) {
    if (
      !sameCheckoutSession(state, scope) ||
      !intent ||
      intent.payload.request_id !== scope.requestId ||
      state.shoppingCart.orderIntent ||
      (state.shoppingCart.pendingOrders[scope.account] &&
        JSON.stringify(
          state.shoppingCart.pendingOrders[scope.account].payload,
        ) !== JSON.stringify(intent.payload))
    )
      return state;
    const current = { ...intent, scope };
    return {
      ...state,
      shoppingCart: {
        ...state.shoppingCart,
        orderIntent: current,
        ...(action.cartReservations ? { cartReservations: action.cartReservations } : {}),
        checkoutResult: null,
        pendingOrders: {
          ...state.shoppingCart.pendingOrders,
          [scope.account]: current,
        },
      },
    };
  }
  if (!ownsCheckout(state, scope, attempt)) return state;
  const current = state.shoppingCart.orderIntent;
  if (action.type === CHECKOUT_ATTEMPT) {
    if (
      checkoutBusy(current) ||
      ["AUTH_REQUIRED", "UNRESOLVED"].includes(current.status)
    )
      return state;
    const next = {
      ...current,
      attempt: current.attempt + 1,
      error: "",
      status:
        current.attempt || current.uncertain ? "RECONCILING" : "SUBMITTING",
    };
    return {
      ...state,
      shoppingCart: {
        ...state.shoppingCart,
        orderIntent: next,
        pendingOrders: {
          ...state.shoppingCart.pendingOrders,
          [scope.account]: next,
        },
      },
    };
  }
  if (!checkoutBusy(current)) return state;
  if (
    action.type === CHECKOUT_FAILED &&
    current.uncertain &&
    action.payload.failure.status === "REJECTED"
  )
    return state;
  if (
    action.type === CHECKOUT_FAILED &&
    action.payload.failure.status !== "REJECTED"
  ) {
    const next = {
      ...current,
      ...action.payload.failure,
      uncertain: current.uncertain || action.payload.failure.uncertain,
    };
    return {
      ...state,
      shoppingCart: {
        ...state.shoppingCart,
        orderIntent: next,
        pendingOrders: {
          ...state.shoppingCart.pendingOrders,
          [scope.account]: next,
        },
      },
    };
  }
  const pendingOrders = { ...state.shoppingCart.pendingOrders };
  const cartReservations = { ...state.shoppingCart.cartReservations };
  delete cartReservations[scope.requestId];
  delete pendingOrders[scope.account];
  if (action.type === CHECKOUT_FAILED)
    return {
      ...state,
      shoppingCart: {
        ...state.shoppingCart,
        orderIntent: null,
        pendingOrders,
        cartReservations,
        checkoutResult: {
          scope,
          status: "REJECTED",
          error: action.payload.failure.error,
        },
      },
    };
  if (action.type !== CHECKOUT_CONFIRMED || !action.payload.order?.id)
    return state;
  const reservation = state.shoppingCart.cartReservations?.[scope.requestId];
  const originalLines = reservation ? reservation.filter(original => state.shoppingCart.cart.some(line =>
    String(line.product?.id) === String(original.productId) && line.lineToken === original.token)) : current.purchased;
  const purchased = new Map(originalLines.map(line => [String(line.productId), line.count]));
  const cart = state.shoppingCart.cart
    .map((line) => ({
      ...line,
      count: line.count - (purchased.get(String(line.product?.id)) || 0),
    }))
    .filter((line) => line.count > 0);
  return {
    ...state,
    product: expiredInventory(state.product),
    shoppingCart: {
      ...state.shoppingCart,
      cart,
      orderIntent: null,
      pendingOrders,
      cartReservations,
      address: {},
      payment: {},
      checkoutResult: {
        scope,
        status: current.status === "RECONCILING" ? "RECOVERED" : "CONFIRMED",
        order: action.payload.order,
      },
    },
  };
}

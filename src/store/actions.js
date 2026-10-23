import {
  forgetOrder,
  orderPayload,
  recoverOrder,
  rememberOrder,
} from "./pendingOrder";
import {
  accountKey,
  CHECKOUT_OPEN,
  CHECKOUT_ATTEMPT,
  CHECKOUT_FAILED,
  CHECKOUT_CONFIRMED,
  CHECKOUT_DISMISS_RESULT,
  checkoutBusy,
  checkoutFailure,
  ownsCheckout,
  sameCheckoutSession,
} from "./checkoutState";
import api, {
  clearAuthToken,
  getStoredToken,
  removeStoredToken,
  setAuthToken,
  storeToken,
} from "../services/api";
import {
  buildProductsParams,
  createQueryKey,
  normalizeQuery,
} from "../utils/query";

export const SET_USER = "SET_USER";
export const SET_ROLES = "SET_ROLES";
export const SET_THEME = "SET_THEME";
export const SET_LANGUAGE = "SET_LANGUAGE";
export const SET_AUTH_INITIALIZED = "SET_AUTH_INITIALIZED";
export const SET_AUTH_VERIFICATION_ERROR = "SET_AUTH_VERIFICATION_ERROR";
export const RESET_ACCOUNT_SESSION = "RESET_ACCOUNT_SESSION";

export const SET_CATEGORIES = "SET_CATEGORIES";
export const SET_CATEGORIES_FETCH_STATE = "SET_CATEGORIES_FETCH_STATE";
export const SET_CATEGORIES_ERROR = "SET_CATEGORIES_ERROR";

export const PRODUCT_LIST_FETCH_STARTED = "PRODUCT_LIST_FETCH_STARTED";
export const PRODUCT_LIST_FETCH_SUCCEEDED = "PRODUCT_LIST_FETCH_SUCCEEDED";
export const PRODUCT_LIST_FETCH_FAILED = "PRODUCT_LIST_FETCH_FAILED";

export const PRODUCT_DETAIL_FETCH_STARTED = "PRODUCT_DETAIL_FETCH_STARTED";
export const PRODUCT_DETAIL_FETCH_SUCCEEDED = "PRODUCT_DETAIL_FETCH_SUCCEEDED";
export const PRODUCT_DETAIL_FETCH_FAILED = "PRODUCT_DETAIL_FETCH_FAILED";

export const CART_ADD_ITEM = "CART_ADD_ITEM";
export const CART_INCREMENT_ITEM = "CART_INCREMENT_ITEM";
export const CART_DECREMENT_ITEM = "CART_DECREMENT_ITEM";
export const CART_REMOVE_ITEM = "CART_REMOVE_ITEM";
export const CART_TOGGLE_ITEM = "CART_TOGGLE_ITEM";
export const CART_RESET = "CART_RESET";
export const SET_ADDRESS_LIST = "SET_ADDRESS_LIST";
export const SET_CREDIT_CARDS = "SET_CREDIT_CARDS";
export const SET_CHECKOUT_ADDRESS = "SET_CHECKOUT_ADDRESS";
export const SET_CHECKOUT_PAYMENT = "SET_CHECKOUT_PAYMENT";

export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const setRoles = (roles) => ({
  type: SET_ROLES,
  payload: roles,
});

export const setTheme = (theme) => ({
  type: SET_THEME,
  payload: theme,
});

export const setLanguage = (language) => ({
  type: SET_LANGUAGE,
  payload: language,
});

export const setAuthInitialized = (isInitialized) => ({
  type: SET_AUTH_INITIALIZED,
  payload: isInitialized,
});

export const setAuthVerificationError = (hasError) => ({
  type: SET_AUTH_VERIFICATION_ERROR,
  payload: hasError,
});

export const resetAccountSession = (preserveCart = false) => ({ type: RESET_ACCOUNT_SESSION, ...(preserveCart ? { preserveCart: true } : {}) });

export const setCategories = (categories) => ({
  type: SET_CATEGORIES,
  payload: categories,
});

export const setCategoriesFetchState = (fetchState) => ({
  type: SET_CATEGORIES_FETCH_STATE,
  payload: fetchState,
});

export const setCategoriesError = (error) => ({
  type: SET_CATEGORIES_ERROR,
  payload: error,
});

export const productListFetchStarted = ({ query, queryKey, requestId }) => ({
  type: PRODUCT_LIST_FETCH_STARTED,
  payload: { query, queryKey, requestId },
});

export const productListFetchSucceeded = ({
  products,
  total,
  query,
  queryKey,
  requestId,
}) => ({
  type: PRODUCT_LIST_FETCH_SUCCEEDED,
  payload: { products, total, query, queryKey, requestId },
});

export const productListFetchFailed = ({
  error,
  query,
  queryKey,
  requestId,
}) => ({
  type: PRODUCT_LIST_FETCH_FAILED,
  payload: { error, query, queryKey, requestId },
});

export const productDetailFetchStarted = ({ productId, requestId }) => ({
  type: PRODUCT_DETAIL_FETCH_STARTED,
  payload: { productId, requestId },
});

export const productDetailFetchSucceeded = ({
  product,
  productId,
  requestId,
}) => ({
  type: PRODUCT_DETAIL_FETCH_SUCCEEDED,
  payload: { product, productId, requestId },
});

export const productDetailFetchFailed = ({ error, productId, requestId }) => ({
  type: PRODUCT_DETAIL_FETCH_FAILED,
  payload: { error, productId, requestId },
});

export const addCartItem = (product) => ({
  type: CART_ADD_ITEM,
  payload: product,
});

export const incrementCartItem = (productId) => ({
  type: CART_INCREMENT_ITEM,
  payload: productId,
});

export const decrementCartItem = (productId) => ({
  type: CART_DECREMENT_ITEM,
  payload: productId,
});

export const removeCartItem = (productId) => ({
  type: CART_REMOVE_ITEM,
  payload: productId,
});

export const toggleCartItem = (productId) => ({
  type: CART_TOGGLE_ITEM,
  payload: productId,
});

export const resetCart = () => ({ type: CART_RESET });

export const setAddressList = (addresses) => ({
  type: SET_ADDRESS_LIST,
  payload: addresses,
});

export const setCreditCards = (cards) => ({
  type: SET_CREDIT_CARDS,
  payload: cards,
});

export const setCheckoutAddress = (address) => ({
  type: SET_CHECKOUT_ADDRESS,
  payload: address,
});

export const setCheckoutPayment = (payment) => ({
  type: SET_CHECKOUT_PAYMENT,
  payload: payment,
});

let rolesRequest = null;
let categoriesRequest = null;
let verifyRequest = null;
const authenticationAttempts = new WeakMap();

function beginAuthenticationAttempt(getState) {
  const attempt = {};
  const sessionRevision = getState().client.sessionRevision;
  authenticationAttempts.set(getState, attempt);
  return () => authenticationAttempts.get(getState) === attempt &&
    getState().client.sessionRevision === sessionRevision;
}
let listRequestSequence = 0;
let detailRequestSequence = 0;

const listRequestsByKey = new Map();
const detailRequestsByProductId = new Map();

function getAuthToken(responseData) {
  return (
    responseData?.token ||
    responseData?.access_token ||
    responseData?.accessToken ||
    null
  );
}

function toUserPayload(authResponse, fallbackEmail = "") {
  const {
    token,
    access_token: accessToken,
    accessToken: camelAccessToken,
    ...userFields
  } = authResponse || {};
  void token;
  void accessToken;
  void camelAccessToken;

  return {
    ...userFields,
    email: userFields.email || fallbackEmail,
  };
}

function toArrayPayload(value, nestedKey) {
  if (Array.isArray(value)) {
    return value;
  }

  if (nestedKey && Array.isArray(value?.[nestedKey])) {
    return value[nestedKey];
  }

  return [];
}

function normalizeError(error, fallbackMessage) {
  if (error && typeof error === "object") {
    return {
      message: error.message || fallbackMessage,
      status: error.status ?? null,
      code: error.code ?? null,
    };
  }

  return {
    message: fallbackMessage,
    status: null,
    code: null,
  };
}

function normalizeProductsResponse(response) {
  const products = toArrayPayload(response?.products || response, "products");
  const total =
    typeof response?.total === "number" ? response.total : products.length;

  return { products, total };
}

export const fetchRolesIfNeeded = ({ force = false } = {}) => {
  return async (dispatch, getState) => {
    const { client } = getState();

    if (!force && client.roles.length > 0) {
      return client.roles;
    }

    if (rolesRequest) {
      return rolesRequest;
    }

    rolesRequest = api
      .get("/roles")
      .then((roles) => {
        const roleList = toArrayPayload(roles, "roles");
        dispatch(setRoles(roleList));
        return roleList;
      })
      .finally(() => {
        rolesRequest = null;
      });

    return rolesRequest;
  };
};

export const fetchCategoriesIfNeeded = ({ force = false } = {}) => {
  return async (dispatch, getState) => {
    const { product } = getState();

    if (!force && product.categories.length > 0) {
      return product.categories;
    }

    if (categoriesRequest) {
      return categoriesRequest;
    }

    dispatch(setCategoriesFetchState("FETCHING"));
    dispatch(setCategoriesError(null));

    categoriesRequest = api
      .get("/categories")
      .then((categories) => {
        const categoryList = toArrayPayload(categories, "categories");
        dispatch(setCategories(categoryList));
        dispatch(setCategoriesFetchState("FETCHED"));
        return categoryList;
      })
      .catch((error) => {
        const serializableError = normalizeError(
          error,
          "Categories could not be loaded.",
        );
        dispatch(setCategoriesFetchState("FAILED"));
        dispatch(setCategoriesError(serializableError));
        throw serializableError;
      })
      .finally(() => {
        categoriesRequest = null;
      });

    return categoriesRequest;
  };
};

export const fetchProductsByQuery = (queryInput, { force = false } = {}) => {
  return async (dispatch, getState) => {
    const query = normalizeQuery(queryInput);
    const queryKey = createQueryKey(query);
    const state = getState().product;

    if (
      !force &&
      state.fetchState === "FETCHED" &&
      state.lastSuccessfulQueryKey === queryKey
    ) {
      return {
        products: state.productList,
        total: state.total,
        query,
        queryKey,
      };
    }

    const pending = listRequestsByKey.get(queryKey);
    if (pending) {
      if (
        state.activeQueryKey !== queryKey ||
        state.activeListRequestId !== pending.requestId
      ) {
        dispatch(
          productListFetchStarted({
            query,
            queryKey,
            requestId: pending.requestId,
          }),
        );
      }
      return pending.request;
    }

    const requestId = ++listRequestSequence;
    dispatch(productListFetchStarted({ query, queryKey, requestId }));

    const request = api
      .get("/products", { params: buildProductsParams(query) })
      .then((response) => {
        const { products, total } = normalizeProductsResponse(response);
        const currentState = getState().product;

        if (
          currentState.activeQueryKey !== queryKey ||
          currentState.activeListRequestId !== requestId
        ) {
          return { products, total, query, queryKey, stale: true };
        }

        dispatch(
          productListFetchSucceeded({
            products,
            total,
            query,
            queryKey,
            requestId,
          }),
        );

        return { products, total, query, queryKey, stale: false };
      })
      .catch((error) => {
        const serializableError = normalizeError(
          error,
          "Products could not be loaded.",
        );
        const currentState = getState().product;

        if (
          currentState.activeQueryKey === queryKey &&
          currentState.activeListRequestId === requestId
        ) {
          dispatch(
            productListFetchFailed({
              error: serializableError,
              query,
              queryKey,
              requestId,
            }),
          );
        }

        throw serializableError;
      })
      .finally(() => {
        if (listRequestsByKey.get(queryKey)?.requestId === requestId)
          listRequestsByKey.delete(queryKey);
      });

    listRequestsByKey.set(queryKey, { requestId, request });
    return request;
  };
};

export const fetchProductsIfNeeded = ({ force = false } = {}) => {
  return fetchProductsByQuery({}, { force });
};

export const fetchProductDetail = (productIdInput, { force = false } = {}) => {
  return async (dispatch, getState) => {
    const productId = Number.parseInt(String(productIdInput), 10);

    if (!Number.isFinite(productId) || productId <= 0) {
      const invalidIdError = {
        message: "Invalid product ID. Please check the URL.",
        status: 400,
        code: "INVALID_PRODUCT_ID",
      };
      dispatch(
        productDetailFetchFailed({
          error: invalidIdError,
          productId: null,
          requestId: null,
        }),
      );
      throw invalidIdError;
    }

    const currentState = getState().product;
    if (
      !force &&
      currentState.selectedProductFetchState === "FETCHED" &&
      currentState.selectedProductId === productId
    ) {
      return currentState.selectedProduct;
    }

    const pending = detailRequestsByProductId.get(productId);
    if (pending) {
      if (
        currentState.selectedProductId !== productId ||
        currentState.activeDetailRequestId !== pending.requestId
      ) {
        dispatch(
          productDetailFetchStarted({
            productId,
            requestId: pending.requestId,
          }),
        );
      }
      return pending.request;
    }

    const requestId = ++detailRequestSequence;
    dispatch(productDetailFetchStarted({ productId, requestId }));

    const request = api
      .get(`/products/${productId}`)
      .then((product) => {
        const stateAfterResponse = getState().product;
        if (
          stateAfterResponse.selectedProductId !== productId ||
          stateAfterResponse.activeDetailRequestId !== requestId
        ) {
          return { product, stale: true };
        }

        dispatch(
          productDetailFetchSucceeded({ product, productId, requestId }),
        );
        return { product, stale: false };
      })
      .catch((error) => {
        const serializableError = normalizeError(
          error,
          "Product could not be loaded.",
        );
        const stateAfterResponse = getState().product;

        if (
          stateAfterResponse.selectedProductId === productId &&
          stateAfterResponse.activeDetailRequestId === requestId
        ) {
          dispatch(
            productDetailFetchFailed({
              error: serializableError,
              productId,
              requestId,
            }),
          );
        }

        throw serializableError;
      })
      .finally(() => {
        if (detailRequestsByProductId.get(productId)?.requestId === requestId)
          detailRequestsByProductId.delete(productId);
      });

    detailRequestsByProductId.set(productId, { requestId, request });
    return request;
  };
};

export const signupUser = (payload) => {
  return async () => {
    return api.post("/signup", payload);
  };
};

export const loginUser = ({ email, password, rememberMe }) => {
  return async (dispatch, getState) => {
    const isCurrent = beginAuthenticationAttempt(getState);
    verifyRequest = null;
    let response;
    try {
      response = await api.post("/login", { email, password });
    } catch (error) {
      if (!isCurrent()) return { authenticated: false, stale: true };
      throw error;
    }
    if (!isCurrent()) return { authenticated: false, stale: true };
    const token = getAuthToken(response);

    if (!token) {
      throw normalizeError(null, "Authentication token was not returned.");
    }

    verifyRequest = null;
    dispatch(resetAccountSession(true));
    setAuthToken(token);

    if (rememberMe) {
      storeToken(token);
    } else {
      removeStoredToken();
    }

    const user = toUserPayload(response, email);
    dispatch(setUser(user));
    dispatch(setAuthInitialized(true));

    return {
      user,
      token,
      response,
    };
  };
};

export const verifyStoredSession = () => {
  return async (dispatch, getState) => {
    if (verifyRequest) {
      return verifyRequest;
    }

    const storedToken = getStoredToken();

    if (!storedToken) {
      authenticationAttempts.delete(getState);
      clearAuthToken();
      dispatch(resetAccountSession());
      dispatch(setAuthInitialized(true));
      return { authenticated: false };
    }

    dispatch(resetAccountSession(true));
    dispatch(setAuthInitialized(false));
    const isCurrent = beginAuthenticationAttempt(getState);
    setAuthToken(storedToken);

    const request = api
      .get("/verify")
      .then((response) => {
        if (!isCurrent()) {
          return { authenticated: false, stale: true };
        }
        const renewedToken = getAuthToken(response) || storedToken;
        setAuthToken(renewedToken);
        storeToken(renewedToken);

        const user = toUserPayload(response);
        dispatch(setUser(user));
        dispatch(setAuthInitialized(true));

        return {
          authenticated: true,
          user,
          token: renewedToken,
        };
      })
      .catch((error) => {
        if (!isCurrent()) {
          return { authenticated: false, stale: true };
        }

        if (error?.status === 401) {
          removeStoredToken();
          clearAuthToken();
          dispatch(resetAccountSession());
          dispatch(setAuthInitialized(true));
          return { authenticated: false };
        }

        dispatch(setAuthVerificationError(true));
        dispatch(setAuthInitialized(true));
        return {
          authenticated: false,
          transient: true,
          error: normalizeError(
            error,
            "Session verification is temporarily unavailable.",
          ),
        };
      })
      .finally(() => {
        if (verifyRequest === request) {
          verifyRequest = null;
        }
      });

    verifyRequest = request;
    return verifyRequest;
  };
};

export const logoutUser = () => {
  return (dispatch, getState) => {
    authenticationAttempts.delete(getState);
    verifyRequest = null;
    removeStoredToken();
    clearAuthToken();
    dispatch(resetAccountSession());
    dispatch(setAuthInitialized(true));
  };
};

function toCollectionPayload(value, keys = []) {
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  return [];
}

function toMutationError(error, fallbackMessage) {
  return normalizeError(error, fallbackMessage);
}

export {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  fetchCreditCards,
  createCreditCard,
  updateCreditCard,
  deleteCreditCard,
} from "./ownedResources";

export const PRODUCT_INVENTORY_INVALIDATED = "PRODUCT_INVENTORY_INVALIDATED";
export const invalidateProductInventory =
  (scope, attempt) => (dispatch, getState) => {
    if (scope && !ownsCheckout(getState(), scope, attempt)) return;
    listRequestsByKey.clear();
    detailRequestsByProductId.clear();
    dispatch({ type: PRODUCT_INVENTORY_INVALIDATED, scope, attempt });
  };

export const restorePendingCheckout = () => (dispatch, getState) => {
  const state = getState();
  const account = accountKey(state.client.user?.email);
  if (!account || state.shoppingCart.orderIntent) return;
  const saved =
    state.shoppingCart.pendingOrders[account] || recoverOrder(account);
  if (!saved) return;
  const scope = {
    account,
    revision: state.client.sessionRevision,
    requestId: saved.payload.request_id,
  };
  const intent = {
    ...saved,
    attempt: saved.attempt || 0,
    status: saved.status === "UNRESOLVED" ? "UNRESOLVED" : "INDETERMINATE",
    uncertain: saved.uncertain || checkoutBusy(saved),
    error:
      saved.status === "UNRESOLVED"
        ? "This purchase is unresolved. Check Previous Orders and resolve the original purchase before another checkout."
        : "",
    scope,
  };
  intent.payload.products.forEach(Object.freeze);
  Object.freeze(intent.payload.products);
  Object.freeze(intent.payload);
  dispatch({ type: CHECKOUT_OPEN, payload: { scope, intent } });
};

export const dismissCheckoutResult = () => (dispatch, getState) => {
  const result = getState().shoppingCart.checkoutResult;
  if (result)
    dispatch({
      type: CHECKOUT_DISMISS_RESULT,
      payload: { scope: result.scope },
    });
};

export const createOrder =
  (payload, { purchased = [] } = {}) =>
  async (dispatch, getState) => {
    dispatch(restorePendingCheckout());
    let intent = getState().shoppingCart.orderIntent;
    if (!intent) {
      const account = accountKey(getState().client.user?.email);
      if (!account) throw { status: 401, message: "Sign in before checkout." };
      const settled = getState().shoppingCart.checkoutResult;
      if (
        settled?.order &&
        sameCheckoutSession(getState(), settled.scope) &&
        payload?.request_id === settled.scope.requestId
      )
        return settled.order;
      if (!payload)
        throw {
          status: 400,
          message: "There is no pending purchase to reconcile.",
        };
      const immutable = orderPayload(payload);
      immutable.products.forEach(Object.freeze);
      Object.freeze(immutable.products);
      Object.freeze(immutable);
      const scope = {
        account,
        revision: getState().client.sessionRevision,
        requestId: immutable.request_id,
      };
      dispatch({
        type: CHECKOUT_OPEN,
        payload: {
          scope,
          intent: {
            scope,
            payload: immutable,
            purchased: purchased.map((line) => ({ ...line })),
            attempt: 0,
            status: "NEW",
            uncertain: false,
            error: "",
          },
        },
      });
      intent = getState().shoppingCart.orderIntent;
    }
    if (
      payload &&
      (payload.request_id !== intent.payload.request_id ||
        JSON.stringify(orderPayload(payload)) !==
          JSON.stringify(intent.payload))
    ) {
      throw {
        code: "PENDING_PURCHASE",
        message:
          "Resolve the retained purchase before starting or changing an order.",
      };
    }
    if (
      checkoutBusy(intent) ||
      ["AUTH_REQUIRED", "UNRESOLVED"].includes(intent.status)
    )
      throw {
        code: "PENDING_PURCHASE",
        message:
          "This purchase requires reconciliation before another submission.",
      };
    const { scope } = intent;
    dispatch({
      type: CHECKOUT_ATTEMPT,
      payload: { scope, attempt: intent.attempt },
    });
    intent = getState().shoppingCart.orderIntent;
    const attempt = intent.attempt;
    rememberOrder(scope.account, intent);
    try {
      const result = await api.post("/order", intent.payload);
      if (!ownsCheckout(getState(), scope, attempt)) return { stale: true };
      if (!result?.id)
        throw new Error(
          "Order response was incomplete. Retry with the same request ID or check history.",
        );
      listRequestsByKey.clear();
      detailRequestsByProductId.clear();
      dispatch({
        type: CHECKOUT_CONFIRMED,
        payload: { scope, attempt, order: result },
      });
      if (
        !sameCheckoutSession(getState(), scope) ||
        getState().shoppingCart.checkoutResult?.scope !== scope
      )
        return { stale: true };
      forgetOrder(scope.account, scope.requestId);
      return result;
    } catch (reason) {
      if (!ownsCheckout(getState(), scope, attempt)) return { stale: true };
      const error = toMutationError(reason, "Order could not be completed.");
      const failure = checkoutFailure(intent, error);
      dispatch({ type: CHECKOUT_FAILED, payload: { scope, attempt, failure } });
      if (!sameCheckoutSession(getState(), scope)) return { stale: true };
      if (failure.status === "REJECTED")
        forgetOrder(scope.account, scope.requestId);
      else rememberOrder(scope.account, getState().shoppingCart.orderIntent);
      throw error;
    }
  };

export const fetchOrders = () => async () => {
  try {
    const response = await api.get("/order");
    return toCollectionPayload(response, ["orders", "data"]);
  } catch (error) {
    throw toMutationError(error, "Previous orders could not be loaded.");
  }
};

let favoritesRequestSequence = 0;
export const FAVORITES_STATE = "FAVORITES_STATE";
export const fetchFavorites = () => async (dispatch, getState) => {
  const revision = getState().client.sessionRevision;
  if (!getState().client.user?.email) return [];
  const requestId = ++favoritesRequestSequence;
  dispatch({
    type: FAVORITES_STATE,
    payload: { revision, requestId, fetchState: "FETCHING", error: "" },
  });
  try {
    const items = await api.get("/user/favorites");
    dispatch({
      type: FAVORITES_STATE,
      payload: { revision, requestId, items, fetchState: "FETCHED", error: "" },
    });
    return items;
  } catch (reason) {
    const error = toMutationError(reason, "Favorites could not be loaded.");
    dispatch({
      type: FAVORITES_STATE,
      payload: {
        revision,
        requestId,
        fetchState: "FAILED",
        error: error.message,
      },
    });
    throw error;
  }
};

export const changeFavorite =
  (productId, add) => async (dispatch, getState) => {
    const revision = getState().client.sessionRevision;
    if (add) await api.put(`/user/favorites/${productId}`);
    else await api.delete(`/user/favorites/${productId}`);
    if (getState().client.sessionRevision === revision)
      await dispatch(fetchFavorites());
  };

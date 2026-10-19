import { OWNED_RESOURCE_STATE } from "./ownedResources";
import { cartScope } from "./cartSession";
import {
  CHECKOUT_OPEN,
  CHECKOUT_ATTEMPT,
  CHECKOUT_FAILED,
  CHECKOUT_CONFIRMED,
  CHECKOUT_DISMISS_RESULT,
  ownsCheckout,
  reduceCheckout,
  checkoutBusy,
  expiredInventory,
  accountKey,
} from "./checkoutState";
import {
  SET_USER,
  PRODUCT_INVENTORY_INVALIDATED,
  FAVORITES_STATE,
  SET_ROLES,
  SET_THEME,
  SET_LANGUAGE,
  SET_AUTH_INITIALIZED,
  SET_AUTH_VERIFICATION_ERROR,
  RESET_ACCOUNT_SESSION,
  SET_CATEGORIES,
  SET_CATEGORIES_FETCH_STATE,
  SET_CATEGORIES_ERROR,
  PRODUCT_LIST_FETCH_STARTED,
  PRODUCT_LIST_FETCH_SUCCEEDED,
  PRODUCT_LIST_FETCH_FAILED,
  PRODUCT_DETAIL_FETCH_STARTED,
  PRODUCT_DETAIL_FETCH_SUCCEEDED,
  PRODUCT_DETAIL_FETCH_FAILED,
  CART_ADD_ITEM,
  CART_INCREMENT_ITEM,
  CART_DECREMENT_ITEM,
  CART_REMOVE_ITEM,
  CART_TOGGLE_ITEM,
  CART_RESET,
  SET_ADDRESS_LIST,
  SET_CREDIT_CARDS,
  SET_CHECKOUT_ADDRESS,
  SET_CHECKOUT_PAYMENT,
} from "./actions";

const initialState = {
  client: {
    user: {},
    favorites: [],
    favoritesRequestId: null,
    favoritesFetchState: "NOT_FETCHED",
    favoritesError: "",
    resourceStatus: {},
    addressList: [],
    creditCards: [],
    roles: [],
    theme: "",
    language: "",
    authInitialized: false,
    authVerificationError: false,
    sessionRevision: 0,
  },
  product: {
    inventoryRevision: 0,
    categories: [],
    productList: [],
    total: 0,
    limit: 25,
    offset: 0,
    filter: "",
    sort: "",
    fetchState: "NOT_FETCHED",
    productListError: null,
    categoriesFetchState: "NOT_FETCHED",
    categoriesError: null,

    activeQuery: {
      category: null,
      sort: "",
      filter: "",
      limit: 25,
      offset: 0,
    },
    activeQueryKey: "",
    lastSuccessfulQueryKey: "",
    activeListRequestId: null,

    selectedProduct: {},
    selectedProductId: null,
    selectedProductFetchState: "NOT_FETCHED",
    selectedProductError: null,
    activeDetailRequestId: null,
  },
  shoppingCart: {
    cartOwner: "guest",
    cartReservations: {},
    cartClaims: {},
    cartValidating: false,
    cartError: "",
    cart: [],
    payment: {},
    address: {},
    orderIntent: null,
    pendingOrders: {},
    checkoutResult: null,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "CART_SESSION_RESTORE":
      return { ...state, shoppingCart: { ...state.shoppingCart, ...action.payload } };
    case "CART_VALIDATING":
      return { ...state, shoppingCart: { ...state.shoppingCart, cartValidating: true, cartError: "" } };
    case "CART_VALIDATION_ERROR":
      return { ...state, shoppingCart: { ...state.shoppingCart, cartValidating: false, cartError: action.payload } };
    case "CART_REVALIDATED": {
      const products = new Map(action.payload.map(product => [String(product.id), product]));
      const cart = state.shoppingCart.cart.map(line => products.has(String(line.product.id))
        ? { ...line, needsRefresh: false, product: { ...line.product, ...products.get(String(line.product.id)) } } : line);
      return { ...state, shoppingCart: { ...state.shoppingCart, cart, cartValidating: false, cartError: "" } };
    }
    case RESET_ACCOUNT_SESSION:
      return {
        ...state,
        client: {
          ...state.client,
          user: {},
          favorites: [],
          favoritesRequestId: null,
          favoritesFetchState: "NOT_FETCHED",
          favoritesError: "",
          resourceStatus: {},
          addressList: [],
          creditCards: [],
          authVerificationError: false,
          sessionRevision: state.client.sessionRevision + 1,
        },
        shoppingCart: {
          ...state.shoppingCart,
          ...(action.cartSession || (!action.preserveCart && state.shoppingCart.cartOwner !== "guest" ? { cartOwner: "guest", cart: [] } : {})),
          cartValidating: false,
          cartError: "",
          address: {},
          orderIntent: null,
          checkoutResult: null,
          pendingOrders: Object.fromEntries(
            Object.entries(state.shoppingCart.pendingOrders).map(
              ([account, intent]) => [
                account,
                checkoutBusy(intent)
                  ? { ...intent, uncertain: true, status: "INDETERMINATE" }
                  : intent,
              ],
            ),
          ),
          payment: {},
        },
      };

    case CHECKOUT_OPEN:
    case CHECKOUT_ATTEMPT:
    case CHECKOUT_FAILED:
    case CHECKOUT_CONFIRMED:
    case CHECKOUT_DISMISS_RESULT:
      return reduceCheckout(state, action);
    case OWNED_RESOURCE_STATE: {
      const { revision, resource, status, items } = action.payload;
      if (revision !== state.client.sessionRevision) return state;
      return {
        ...state,
        client: {
          ...state.client,
          ...(items
            ? {
                [resource === "addresses" ? "addressList" : "creditCards"]:
                  items,
              }
            : {}),
          resourceStatus: {
            ...state.client.resourceStatus,
            [resource]: status,
          },
        },
      };
    }
    case PRODUCT_INVENTORY_INVALIDATED:
      if (action.scope && !ownsCheckout(state, action.scope, action.attempt))
        return state;
      return {
        ...state,
        product: expiredInventory(state.product),
      };

    case FAVORITES_STATE:
      if (
        action.payload.revision !== state.client.sessionRevision ||
        (action.payload.fetchState !== "FETCHING" &&
          action.payload.requestId !== state.client.favoritesRequestId)
      )
        return state;
      return {
        ...state,
        client: {
          ...state.client,
          favorites: action.payload.items || state.client.favorites,
          favoritesRequestId: action.payload.requestId,
          favoritesFetchState: action.payload.fetchState,
          favoritesError: action.payload.error,
        },
      };

    case SET_USER: {
      if (
        accountKey(state.client.user?.email) &&
        accountKey(state.client.user?.email) !==
          accountKey(action.payload?.email)
      ) {
        state = reducer(state, { type: RESET_ACCOUNT_SESSION });
      }
      return {
        ...state,
        shoppingCart: { ...state.shoppingCart,
          ...(action.cartSession || { cartOwner: cartScope(action.payload) }) },
        client: {
          ...state.client,
          user: action.payload,
        },
      };
    }

    case SET_ADDRESS_LIST:
      return {
        ...state,
        client: { ...state.client, addressList: action.payload },
      };

    case SET_CREDIT_CARDS:
      return {
        ...state,
        client: { ...state.client, creditCards: action.payload },
      };

    case SET_ROLES:
      return {
        ...state,
        client: {
          ...state.client,
          roles: action.payload,
        },
      };

    case SET_THEME:
      return {
        ...state,
        client: {
          ...state.client,
          theme: action.payload,
        },
      };

    case SET_LANGUAGE:
      return {
        ...state,
        client: {
          ...state.client,
          language: action.payload,
        },
      };

    case SET_AUTH_INITIALIZED:
      return {
        ...state,
        client: {
          ...state.client,
          authInitialized: action.payload,
        },
      };

    case SET_AUTH_VERIFICATION_ERROR:
      return {
        ...state,
        client: {
          ...state.client,
          authVerificationError: Boolean(action.payload),
        },
      };

    case SET_CATEGORIES:
      return {
        ...state,
        product: {
          ...state.product,
          categories: action.payload,
        },
      };

    case SET_CATEGORIES_FETCH_STATE:
      return {
        ...state,
        product: {
          ...state.product,
          categoriesFetchState: action.payload,
        },
      };

    case SET_CATEGORIES_ERROR:
      return {
        ...state,
        product: {
          ...state.product,
          categoriesError: action.payload,
        },
      };

    case PRODUCT_LIST_FETCH_STARTED:
      return {
        ...state,
        product: {
          ...state.product,
          fetchState: "FETCHING",
          productListError: null,
          activeQuery: action.payload.query,
          activeQueryKey: action.payload.queryKey,
          activeListRequestId: action.payload.requestId,
          limit: action.payload.query.limit,
          offset: action.payload.query.offset,
          filter: action.payload.query.filter,
          sort: action.payload.query.sort,
        },
      };

    case PRODUCT_LIST_FETCH_SUCCEEDED:
      if (
        state.product.activeQueryKey !== action.payload.queryKey ||
        state.product.activeListRequestId !== action.payload.requestId
      ) {
        return state;
      }

      return {
        ...state,
        product: {
          ...state.product,
          productList: action.payload.products,
          total: action.payload.total,
          fetchState: "FETCHED",
          productListError: null,
          lastSuccessfulQueryKey: action.payload.queryKey,
        },
      };

    case PRODUCT_LIST_FETCH_FAILED:
      if (
        state.product.activeQueryKey !== action.payload.queryKey ||
        state.product.activeListRequestId !== action.payload.requestId
      ) {
        return state;
      }

      return {
        ...state,
        product: {
          ...state.product,
          fetchState: "FAILED",
          productListError: action.payload.error,
        },
      };

    case PRODUCT_DETAIL_FETCH_STARTED:
      return {
        ...state,
        product: {
          ...state.product,
          selectedProduct: {},
          selectedProductId: action.payload.productId,
          selectedProductFetchState: "FETCHING",
          selectedProductError: null,
          activeDetailRequestId: action.payload.requestId,
        },
      };

    case PRODUCT_DETAIL_FETCH_SUCCEEDED:
      if (
        state.product.selectedProductId !== action.payload.productId ||
        state.product.activeDetailRequestId !== action.payload.requestId
      ) {
        return state;
      }

      return {
        ...state,
        product: {
          ...state.product,
          selectedProduct: action.payload.product,
          selectedProductId: action.payload.productId,
          selectedProductFetchState: "FETCHED",
          selectedProductError: null,
        },
      };

    case PRODUCT_DETAIL_FETCH_FAILED:
      if (
        action.payload.requestId !== null &&
        (state.product.selectedProductId !== action.payload.productId ||
          state.product.activeDetailRequestId !== action.payload.requestId)
      ) {
        return state;
      }

      return {
        ...state,
        product: {
          ...state.product,
          selectedProduct: {},
          selectedProductId: action.payload.productId,
          selectedProductFetchState: "FAILED",
          selectedProductError: action.payload.error,
        },
      };

    case CART_ADD_ITEM: {
      const product = action.payload;
      const capacity = Math.min(99, Number.isFinite(product.stock) ? product.stock : 99);
      if (capacity <= 0) return state;
      const existing = state.shoppingCart.cart.some(
        (item) => String(item.product?.id) === String(product?.id),
      );

      const cart = existing
        ? state.shoppingCart.cart.map((item) =>
            String(item.product?.id) === String(product.id)
              ? { ...item, count: Math.max(item.count, Math.min(capacity, item.count + 1)), product, needsRefresh: false }
              : item,
          )
        : [...state.shoppingCart.cart, { count: 1, checked: true, product, ...(action.lineToken ? { lineToken: action.lineToken } : {}) }];

      return {
        ...state,
        shoppingCart: { ...state.shoppingCart, cart },
      };
    }

    case CART_INCREMENT_ITEM:
    case CART_DECREMENT_ITEM: {
      const amount = action.type === CART_INCREMENT_ITEM ? 1 : -1;
      const cart = state.shoppingCart.cart.map((item) => {
        if (String(item.product?.id) !== String(action.payload)) return item;
        const capacity = Math.min(99, Number.isFinite(item.product.stock) ? item.product.stock : 99);
        return { ...item, count: amount > 0 ? Math.max(item.count, Math.min(capacity, item.count + 1)) : Math.max(1, item.count - 1) };
      });

      return {
        ...state,
        shoppingCart: { ...state.shoppingCart, cart },
      };
    }

    case CART_REMOVE_ITEM:
      return {
        ...state,
        shoppingCart: {
          ...state.shoppingCart,
          cart: state.shoppingCart.cart.filter(
            (item) => String(item.product?.id) !== String(action.payload),
          ),
        },
      };

    case CART_TOGGLE_ITEM:
      return {
        ...state,
        shoppingCart: {
          ...state.shoppingCart,
          cart: state.shoppingCart.cart.map((item) =>
            String(item.product?.id) === String(action.payload)
              ? { ...item, checked: !item.checked }
              : item,
          ),
        },
      };

    case CART_RESET:
      return {
        ...state,
        shoppingCart: {
          ...state.shoppingCart,
          cart: [],
          address: {},
          payment: {},
        },
      };

    case SET_CHECKOUT_ADDRESS:
      return {
        ...state,
        shoppingCart: { ...state.shoppingCart, address: action.payload || {} },
      };

    case SET_CHECKOUT_PAYMENT:
      return {
        ...state,
        shoppingCart: { ...state.shoppingCart, payment: action.payload || {} },
      };

    default:
      return state;
  }
}

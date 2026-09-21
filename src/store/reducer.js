import {
  SET_USER,
  SET_ROLES,
  SET_THEME,
  SET_LANGUAGE,
  SET_AUTH_INITIALIZED,
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
    addressList: [],
    creditCards: [],
    roles: [],
    theme: "",
    language: "",
    authInitialized: false,
  },
  product: {
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
    cart: [],
    payment: {},
    address: {},
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        client: {
          ...state.client,
          user: action.payload,
        },
      };

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
      const existing = state.shoppingCart.cart.some(
        (item) => String(item.product?.id) === String(product?.id),
      );

      const cart = existing
        ? state.shoppingCart.cart.map((item) =>
            String(item.product?.id) === String(product.id)
              ? { ...item, count: item.count + 1 }
              : item,
          )
        : [
            ...state.shoppingCart.cart,
            { count: 1, checked: true, product },
          ];

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
        return { ...item, count: Math.max(1, item.count + amount) };
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
        shoppingCart: { ...state.shoppingCart, cart: [], address: {}, payment: {} },
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

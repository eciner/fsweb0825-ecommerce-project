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

export const productListFetchFailed = ({ error, query, queryKey, requestId }) => ({
  type: PRODUCT_LIST_FETCH_FAILED,
  payload: { error, query, queryKey, requestId },
});

export const productDetailFetchStarted = ({ productId, requestId }) => ({
  type: PRODUCT_DETAIL_FETCH_STARTED,
  payload: { productId, requestId },
});

export const productDetailFetchSucceeded = ({ product, productId, requestId }) => ({
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

    if (listRequestsByKey.has(queryKey)) {
      return listRequestsByKey.get(queryKey);
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
        listRequestsByKey.delete(queryKey);
      });

    listRequestsByKey.set(queryKey, request);
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

    if (detailRequestsByProductId.has(productId)) {
      return detailRequestsByProductId.get(productId);
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

        dispatch(productDetailFetchSucceeded({ product, productId, requestId }));
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
        detailRequestsByProductId.delete(productId);
      });

    detailRequestsByProductId.set(productId, request);
    return request;
  };
};

export const signupUser = (payload) => {
  return async () => {
    return api.post("/signup", payload);
  };
};

export const loginUser = ({ email, password, rememberMe }) => {
  return async (dispatch) => {
    const response = await api.post("/login", { email, password });
    const token = getAuthToken(response);

    if (!token) {
      throw normalizeError(null, "Authentication token was not returned.");
    }

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
  return async (dispatch) => {
    if (verifyRequest) {
      return verifyRequest;
    }

    const storedToken = getStoredToken();

    if (!storedToken) {
      clearAuthToken();
      dispatch(setUser({}));
      dispatch(setAuthInitialized(true));
      return { authenticated: false };
    }

    setAuthToken(storedToken);

    verifyRequest = api
      .get("/verify")
      .then((response) => {
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
      .catch(() => {
        removeStoredToken();
        clearAuthToken();
        dispatch(setUser({}));
        dispatch(setAuthInitialized(true));
        return {
          authenticated: false,
        };
      })
      .finally(() => {
        verifyRequest = null;
      });

    return verifyRequest;
  };
};

export const logoutUser = () => {
  return (dispatch) => {
    removeStoredToken();
    clearAuthToken();
    dispatch(setUser({}));
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

export const fetchAddresses = () => async (dispatch) => {
  try {
    const response = await api.get("/user/address");
    const addresses = toCollectionPayload(response, ["addresses", "address"]);
    dispatch(setAddressList(addresses));
    return addresses;
  } catch (error) {
    throw toMutationError(error, "Addresses could not be loaded.");
  }
};

export const createAddress = (payload) => async (dispatch) => {
  try {
    await api.post("/user/address", payload);
    return dispatch(fetchAddresses());
  } catch (error) {
    throw toMutationError(error, "Address could not be created.");
  }
};

export const updateAddress = (payload) => async (dispatch) => {
  try {
    await api.put("/user/address", payload);
    return dispatch(fetchAddresses());
  } catch (error) {
    throw toMutationError(error, "Address could not be updated.");
  }
};

export const deleteAddress = (addressId) => async (dispatch) => {
  try {
    await api.delete(`/user/address/${addressId}`);
    return dispatch(fetchAddresses());
  } catch (error) {
    throw toMutationError(error, "Address could not be deleted.");
  }
};

export const fetchCreditCards = () => async (dispatch) => {
  try {
    const response = await api.get("/user/card");
    const cards = toCollectionPayload(response, ["cards", "creditCards"]);
    dispatch(setCreditCards(cards));
    return cards;
  } catch (error) {
    throw toMutationError(error, "Saved cards could not be loaded.");
  }
};

export const createCreditCard = (payload) => async (dispatch) => {
  try {
    await api.post("/user/card", payload);
    return dispatch(fetchCreditCards());
  } catch (error) {
    throw toMutationError(error, "Card could not be saved.");
  }
};

export const updateCreditCard = (payload) => async (dispatch) => {
  try {
    await api.put("/user/card", payload);
    return dispatch(fetchCreditCards());
  } catch (error) {
    throw toMutationError(error, "Card could not be updated.");
  }
};

export const deleteCreditCard = (cardId) => async (dispatch) => {
  try {
    await api.delete(`/user/card/${cardId}`);
    return dispatch(fetchCreditCards());
  } catch (error) {
    throw toMutationError(error, "Card could not be deleted.");
  }
};

export const createOrder = (payload) => async () => {
  try {
    return await api.post("/order", payload);
  } catch (error) {
    throw toMutationError(error, "Order could not be completed.");
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

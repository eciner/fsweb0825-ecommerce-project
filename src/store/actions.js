// Action Types
export const SET_USER = "SET_USER";
export const SET_PRODUCTS = "SET_PRODUCTS";
export const ADD_TO_CART = "ADD_TO_CART";
export const REMOVE_FROM_CART = "REMOVE_FROM_CART";
export const UPDATE_CART_ITEM_QUANTITY = "UPDATE_CART_ITEM_QUANTITY";
export const CLEAR_CART = "CLEAR_CART";
export const TOGGLE_FAVORITE = "TOGGLE_FAVORITE";
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";

// Action Creators
export const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

export const setProducts = (products) => ({
  type: SET_PRODUCTS,
  payload: products,
});

export const addToCart = (product, quantity = 1) => ({
  type: ADD_TO_CART,
  payload: { product, quantity },
});

export const removeFromCart = (productId) => ({
  type: REMOVE_FROM_CART,
  payload: productId,
});

export const updateCartItemQuantity = (productId, quantity) => ({
  type: UPDATE_CART_ITEM_QUANTITY,
  payload: { productId, quantity },
});

export const clearCart = () => ({
  type: CLEAR_CART,
});

export const toggleFavorite = (productId) => ({
  type: TOGGLE_FAVORITE,
  payload: productId,
});

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

// Thunk Actions
export const fetchProducts = () => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      // For now, we'll use local data
      // In the future, this would call the API:
      // const products = await api.get('/products');
      const { products } = await import('../data/products');
      dispatch(setProducts(products));
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    }
  };
};

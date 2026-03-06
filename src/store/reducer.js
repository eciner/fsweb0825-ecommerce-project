import {
  SET_USER,
  SET_PRODUCTS,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM_QUANTITY,
  CLEAR_CART,
  TOGGLE_FAVORITE,
  SET_LOADING,
  SET_ERROR,
} from "./actions";

const initialState = {
  user: null,
  products: [],
  cart: [],
  favorites: [],
  loading: false,
  error: null,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };

    case SET_PRODUCTS:
      return {
        ...state,
        products: action.payload,
      };

    case ADD_TO_CART: {
      const { product, quantity } = action.payload;
      const existingItem = state.cart.find((item) => item.id === product.id);

      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        cart: [...state.cart, { ...product, quantity }],
      };
    }

    case REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };

    case UPDATE_CART_ITEM_QUANTITY:
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case CLEAR_CART:
      return {
        ...state,
        cart: [],
      };

    case TOGGLE_FAVORITE: {
      const productId = action.payload;
      const isFavorite = state.favorites.includes(productId);

      return {
        ...state,
        favorites: isFavorite
          ? state.favorites.filter((id) => id !== productId)
          : [...state.favorites, productId],
      };
    }

    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}

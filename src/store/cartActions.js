import api from "../services/api";
const pendingAdds = new WeakMap();
const validations = new WeakMap();
function canonicalProduct(product, id) {
  if (Number(product?.id) !== Number(id) || !Number.isInteger(product?.stock) || product.stock < 0 || !Number.isFinite(Number(product.price)))
    throw new Error("Catalog information could not be verified. Retry the cart check.");
  return { ...product, unavailable: false };
}
export const revalidateCart = () => async (dispatch, getState) => {
  const { cart, cartOwner } = getState().shoppingCart;
  const revision = getState().client.sessionRevision;
  const request = (validations.get(getState) || 0) + 1;
  validations.set(getState, request);
  dispatch({ type: "CART_VALIDATING", payload: true });
  try {
    const products = await Promise.all(cart.map(async line => {
      try { return canonicalProduct(await api.get(`/products/${line.product.id}`), line.product.id); }
      catch (error) { if (error.status === 404) return { id: line.product.id, unavailable: true, stock: 0 }; throw error; }
    }));
    if (getState().shoppingCart.cartOwner !== cartOwner || getState().client.sessionRevision !== revision || validations.get(getState) !== request)
      throw new Error("The shopping session changed. Review the current cart.");
    dispatch({ type: "CART_REVALIDATED", payload: products });
    return getState().shoppingCart.cart;
  } catch (error) {
    if (getState().shoppingCart.cartOwner === cartOwner && getState().client.sessionRevision === revision && validations.get(getState) === request)
      dispatch({ type: "CART_VALIDATION_ERROR", payload: error.message || "Cart could not be checked. Retry before checkout." });
    throw error;
  }
};
export const addProductToCart = id => (dispatch, getState) => {
  if (!pendingAdds.has(getState)) pendingAdds.set(getState, new Map());
  const pending = pendingAdds.get(getState);
  const owner = getState().shoppingCart.cartOwner;
  const revision = getState().client.sessionRevision;
  const key = `${owner}:${revision}:${id}`;
  if (pending.has(key)) return pending.get(key);
  const request = api.get(`/products/${id}`).then(product => {
    product = canonicalProduct(product, id);
    if (getState().shoppingCart.cartOwner !== owner || getState().client.sessionRevision !== revision)
      throw new Error("The shopping session changed. Add this item to the current cart again.");
    const existing = getState().shoppingCart.cart.find(line => String(line.product.id) === String(id));
    if (!product.stock || (existing?.count || 0) >= Math.min(99, product.stock)) throw new Error("No additional stock is available for this item.");
    if (!existing && getState().shoppingCart.cart.length >= 100) throw new Error("The cart supports up to 100 different products.");
    dispatch({ type: "CART_ADD_ITEM", payload: product });
  }).finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
};

import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { legacy_createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import reducer from "./reducer";
import { cartPersistence, readCart, writeCart } from "./cartSession";
import { addProductToCart, revalidateCart } from "./cartActions";
import { addCartItem, setUser, logoutUser, createOrder, loginUser } from "./actions";
import api from "../services/api";

let entries;
const product = { id: 1, name: "Canonical product", stock: 10, price: 20 };
const account = id => ({ id, email: `synthetic-${id}@example.test` });
function store() { return legacy_createStore(reducer, applyMiddleware(thunk, cartPersistence)); }
beforeEach(() => {
  entries = new Map();
  vi.stubGlobal("localStorage", { getItem: key => entries.get(key) || null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) });
  vi.stubGlobal("sessionStorage", globalThis.localStorage);
  vi.stubGlobal("window", { sessionStorage: globalThis.sessionStorage, localStorage: globalThis.localStorage });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("persists a guest cart across store recreation without persisting prices or account data", () => {
  const first = store(); first.dispatch(addCartItem(product));
  const persisted = JSON.parse(entries.get("wit.cart.v1:guest"));
  expect(persisted.lines).toEqual([{ id: 1, count: 1, checked: true, lineToken: expect.any(String) }]);
  expect(JSON.stringify(persisted)).not.toMatch(/Canonical|price|email|password|token"/);
  const second = store(); second.dispatch({ type: "CART_SESSION_RESTORE", payload: { cartOwner: "guest", cart: readCart("guest") } });
  expect(second.getState().shoppingCart.cart[0].count).toBe(1);
  expect(second.getState().shoppingCart.cart[0].needsRefresh).toBe(true);
});
it("merges guest quantities once, including after repeated sign-in and reload", () => {
  writeCart("account:1", [{ product, count: 2, checked: false }]);
  const current = store(); current.dispatch(addCartItem(product));
  current.dispatch(setUser(account(1))); current.dispatch(setUser(account(1)));
  expect(current.getState().shoppingCart.cart[0].count).toBe(3);
  expect(readCart("guest")).toEqual([]);
  const returned = store(); returned.dispatch(setUser(account(1)));
  expect(returned.getState().shoppingCart.cart[0].count).toBe(3);
});
it("a stale second tab cannot merge the same guest lines into an existing account twice", () => {
  writeCart("account:1", [{ product, count: 2, checked: true }]);
  const first = store(); first.dispatch(addCartItem(product));
  const second = store(); second.dispatch({ type: "CART_SESSION_RESTORE", payload: { cartOwner: "guest", cart: readCart("guest") } });
  first.dispatch(setUser(account(1))); second.dispatch(setUser(account(1)));
  expect(first.getState().shoppingCart.cart[0].count).toBe(3);
  expect(second.getState().shoppingCart.cart[0].count).toBe(3);
});
it("hides an account cart at logout and never merges it into another account", () => {
  const current = store(); current.dispatch(setUser(account(1))); current.dispatch(addCartItem(product));
  current.dispatch(logoutUser()); expect(current.getState().shoppingCart.cart).toEqual([]);
  current.dispatch(setUser(account(2))); expect(current.getState().shoppingCart.cart).toEqual([]);
  current.dispatch(setUser(account(1))); expect(current.getState().shoppingCart.cart[0].count).toBe(1);
});
it("deduplicates simultaneous card actions while allowing a later deliberate quantity increase", async () => {
  let resolve; const get = vi.spyOn(api, "get").mockReturnValueOnce(new Promise(done => { resolve = done; })).mockResolvedValue(product);
  const current = store(); const a = current.dispatch(addProductToCart(1)), b = current.dispatch(addProductToCart(1));
  resolve(product); await Promise.all([a, b]); expect(get).toHaveBeenCalledTimes(1);
  expect(current.getState().shoppingCart.cart[0].count).toBe(1);
  await current.dispatch(addProductToCart(1)); expect(current.getState().shoppingCart.cart[0].count).toBe(2);
});
it("a failed catalog read leaves the cart unchanged", async () => {
  vi.spyOn(api, "get").mockRejectedValue({ status: 503, message: "Unavailable" });
  const current = store(); await expect(current.dispatch(addProductToCart(1))).rejects.toMatchObject({ status: 503 });
  expect(current.getState().shoppingCart.cart).toEqual([]);
});
it("enforces stock limits and replaces cached prices with canonical data on revalidation", async () => {
  const current = store(); current.dispatch(addCartItem({ ...product, stock: 1, price: 1 }));
  vi.spyOn(api, "get").mockResolvedValue({ ...product, stock: 1 });
  await expect(current.dispatch(addProductToCart(1))).rejects.toThrow(/stock/);
  current.dispatch({ type: "CART_INCREMENT_ITEM", payload: 1 });
  expect(current.getState().shoppingCart.cart[0].count).toBe(1);
  await current.dispatch(revalidateCart()); expect(current.getState().shoppingCart.cart[0].product.price).toBe(20);
});
it("rejects a late account-A add instead of adding into account B", async () => {
  let resolve; vi.spyOn(api, "get").mockReturnValue(new Promise(done => { resolve = done; }));
  const current = store(); current.dispatch(setUser(account(1))); const pending = current.dispatch(addProductToCart(1));
  current.dispatch(setUser(account(2))); resolve(product);
  await expect(pending).rejects.toThrow(/session changed/); expect(current.getState().shoppingCart.cart).toEqual([]);
});
it("an older cart validation cannot overwrite a newer price/availability snapshot", async () => {
  let resolve; vi.spyOn(api, "get").mockReturnValueOnce(new Promise(done => { resolve = done; })).mockResolvedValue(product);
  const current = store(); current.dispatch(addCartItem(product)); const older = current.dispatch(revalidateCart());
  await current.dispatch(revalidateCart()); resolve({ ...product, price: 1 });
  await expect(older).rejects.toThrow(); expect(current.getState().shoppingCart.cart[0].product.price).toBe(20);
});
it("handles corrupt/blocked storage without restoring untrusted product details", () => {
  entries.set("wit.cart.v1:guest", JSON.stringify([{ id: 1, count: 2, price: 0.01, token: "excluded" }, { id: -1, count: 1 }]));
  const cart = readCart("guest"); expect(cart).toHaveLength(1); expect(cart[0].product.price).toBe(0);
  expect(JSON.stringify(cart)).not.toContain("excluded");
  expect(readCart("guest", { getItem() { throw new Error("Denied"); } })).toEqual([]);
  expect(() => writeCart("guest", cart, { setItem() { throw new Error("Denied"); } })).not.toThrow();
});
for (const replace of [false, true]) it(`recovered checkout consumes only persisted original cart lines (replaced=${replace})`, async () => {
  vi.spyOn(api, "post").mockRejectedValueOnce({ message: "Response lost" }).mockResolvedValueOnce({ id: 10, products: [] });
  const first = store(); first.dispatch(setUser(account(1))); first.dispatch(addCartItem(product));
  const payload = { request_id: crypto.randomUUID(), address_id: 1, price: 20, products: [{ product_id: 1, count: 1 }] };
  await expect(first.dispatch(createOrder(payload, { purchased: [{ productId: 1, count: 1 }] }))).rejects.toBeTruthy();
  expect(first.getState().shoppingCart.orderIntent?.status).toBe("INDETERMINATE");
  const returned = store(); returned.dispatch(setUser(account(1)));
  if (replace) returned.dispatch({ type: "CART_REMOVE_ITEM", payload: 1 });
  returned.dispatch(addCartItem(product));
  await returned.dispatch(createOrder());
  expect(returned.getState().shoppingCart.cart[0].count).toBe(1);
  expect(returned.getState().shoppingCart.cartReservations).toEqual({});
});
it("a same-session pending purchase cannot consume an item removed and added again", async () => {
  vi.spyOn(api, "post").mockRejectedValueOnce({ message: "Response lost" }).mockResolvedValueOnce({ id: 10, products: [] });
  const current = store(); current.dispatch(setUser(account(1))); current.dispatch(addCartItem(product));
  const payload = { request_id: crypto.randomUUID(), address_id: 1, products: [{ product_id: 1, count: 1 }] };
  await expect(current.dispatch(createOrder(payload, { purchased: [{ productId: 1, count: 1 }] }))).rejects.toBeTruthy();
  current.dispatch({ type: "CART_REMOVE_ITEM", payload: 1 }); current.dispatch(addCartItem(product));
  await current.dispatch(createOrder()); expect(current.getState().shoppingCart.cart[0].count).toBe(1);
});
it("login/logout retain an isolated in-memory cart when browser storage is denied", async () => {
  const denied = { getItem() { throw new Error("Denied"); }, setItem() { throw new Error("Denied"); }, removeItem() { throw new Error("Denied"); } };
  vi.stubGlobal("localStorage", denied); window.localStorage = denied;
  vi.spyOn(api, "post").mockResolvedValue({ ...account(1), token: "synthetic-session-value" });
  const current = store(); current.dispatch(addCartItem(product));
  await current.dispatch(loginUser({ email: account(1).email, password: "Synthetic-only", rememberMe: true }));
  expect(current.getState().shoppingCart.cart[0].count).toBe(1); expect(current.getState().client.user).not.toHaveProperty("token");
  current.dispatch(logoutUser()); expect(current.getState().shoppingCart.cart).toEqual([]);
  await current.dispatch(loginUser({ email: account(1).email, password: "Synthetic-only", rememberMe: false }));
  expect(current.getState().shoppingCart.cart[0].count).toBe(1);
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyMiddleware, legacy_createStore as createStore } from "redux";
import { thunk } from "redux-thunk";

import api, { API_TIMEOUT_MS, clearAuthToken } from "../services/api";
import reducer from "./reducer";
import {
  addCartItem,
  fetchAddresses,
  fetchCreditCards,
  fetchProductDetail,
  fetchProductsByQuery,
  loginUser,
  logoutUser,
  setAddressList,
  setCategories,
  setCheckoutAddress,
  setCheckoutPayment,
  setCreditCards,
  setRoles,
  setUser,
  verifyStoredSession,
} from "./actions";
import { createQueryKey, normalizeQuery } from "../utils/query";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function createTestStore() {
  return createStore(reducer, applyMiddleware(thunk));
}

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function seedPrivateState(store) {
  store.dispatch(setUser({ email: "alice@example.com" }));
  store.dispatch(setAddressList([{ id: 1, title: "Alice's address" }]));
  store.dispatch(setCreditCards([{ id: 1, card_no: "1234123412341234" }]));
  store.dispatch(setCheckoutAddress({ shipping: { id: 1 } }));
  store.dispatch(setCheckoutPayment({ card_no: "1234123412341234" }));
}

beforeEach(() => {
  vi.stubGlobal("window", { localStorage: createStorage() });
  clearAuthToken();
});

afterEach(() => {
  vi.restoreAllMocks();
  clearAuthToken();
  vi.unstubAllGlobals();
});

describe("in-flight product requests", () => {
  it("reactivates list A without refetching and ignores B when B resolves first", async () => {
    const a = deferred();
    const b = deferred();
    const get = vi.spyOn(api, "get").mockImplementation((_path, config) =>
      config.params.filter === "A" ? a.promise : b.promise,
    );
    const store = createTestStore();
    const queryA = { filter: "A" };
    const queryB = { filter: "B" };
    const keyA = createQueryKey(normalizeQuery(queryA));

    const firstA = store.dispatch(fetchProductsByQuery(queryA));
    const requestB = store.dispatch(fetchProductsByQuery(queryB));
    const reusedA = store.dispatch(fetchProductsByQuery(queryA));

    expect(get).toHaveBeenCalledTimes(2);
    expect(store.getState().product.activeQueryKey).toBe(keyA);
    expect(store.getState().product.activeQuery.filter).toBe("A");

    b.resolve({ products: [{ id: 2 }], total: 1 });
    await requestB;
    expect(store.getState().product.fetchState).toBe("FETCHING");
    expect(store.getState().product.productList).toEqual([]);

    a.resolve({ products: [{ id: 1 }], total: 1 });
    await Promise.all([firstA, reusedA]);
    expect(store.getState().product.productList).toEqual([{ id: 1 }]);
    expect(store.getState().product.lastSuccessfulQueryKey).toBe(keyA);
  });

  it("ignores a prior list A when the user remains on B", async () => {
    const a = deferred();
    const b = deferred();
    vi.spyOn(api, "get").mockImplementation((_path, config) =>
      config.params.filter === "A" ? a.promise : b.promise,
    );
    const store = createTestStore();
    const requestA = store.dispatch(fetchProductsByQuery({ filter: "A" }));
    const requestB = store.dispatch(fetchProductsByQuery({ filter: "B" }));

    a.resolve({ products: [{ id: 1 }], total: 1 });
    await requestA;
    expect(store.getState().product.fetchState).toBe("FETCHING");

    b.resolve({ products: [{ id: 2 }], total: 1 });
    await requestB;
    expect(store.getState().product.productList).toEqual([{ id: 2 }]);
  });

  it("reactivates detail A without refetching and ignores B when B resolves first", async () => {
    const a = deferred();
    const b = deferred();
    const get = vi.spyOn(api, "get").mockImplementation((path) =>
      path === "/products/1" ? a.promise : b.promise,
    );
    const store = createTestStore();

    const firstA = store.dispatch(fetchProductDetail(1));
    const requestB = store.dispatch(fetchProductDetail(2));
    const reusedA = store.dispatch(fetchProductDetail(1));

    expect(get).toHaveBeenCalledTimes(2);
    expect(store.getState().product.selectedProductId).toBe(1);
    expect(store.getState().product.selectedProductFetchState).toBe("FETCHING");

    b.resolve({ id: 2 });
    await requestB;
    expect(store.getState().product.selectedProduct).toEqual({});

    a.resolve({ id: 1 });
    await Promise.all([firstA, reusedA]);
    expect(store.getState().product.selectedProduct).toEqual({ id: 1 });
    expect(store.getState().product.selectedProductFetchState).toBe("FETCHED");
  });

  it("does not render detail A if the user remains on B", async () => {
    const a = deferred();
    const b = deferred();
    vi.spyOn(api, "get").mockImplementation((path) =>
      path === "/products/1" ? a.promise : b.promise,
    );
    const store = createTestStore();
    const requestA = store.dispatch(fetchProductDetail(1));
    const requestB = store.dispatch(fetchProductDetail(2));

    a.resolve({ id: 1 });
    await requestA;
    expect(store.getState().product.selectedProduct).toEqual({});

    b.resolve({ id: 2 });
    await requestB;
    expect(store.getState().product.selectedProduct).toEqual({ id: 2 });
  });
});

describe("account session", () => {
  it("clears private account data on logout while preserving cart and shared data", () => {
    const store = createTestStore();
    seedPrivateState(store);
    store.dispatch(setRoles([{ id: 1 }]));
    store.dispatch(setCategories([{ id: 2 }]));
    store.dispatch(addCartItem({ id: 3 }));
    window.localStorage.setItem("token", "old-token");

    store.dispatch(logoutUser());

    const state = store.getState();
    expect(window.localStorage.getItem("token")).toBeNull();
    expect(api.defaults.headers.common.Authorization).toBeUndefined();
    expect(state.client.user).toEqual({});
    expect(state.client.addressList).toEqual([]);
    expect(state.client.creditCards).toEqual([]);
    expect(state.shoppingCart.address).toEqual({});
    expect(state.shoppingCart.payment).toEqual({});
    expect(state.shoppingCart.cart).toHaveLength(1);
    expect(state.client.roles).toEqual([{ id: 1 }]);
    expect(state.product.categories).toEqual([{ id: 2 }]);
  });

  it("prevents an old address or card response from populating a new account", async () => {
    const address = deferred();
    const cards = deferred();
    vi.spyOn(api, "get").mockImplementation((path) =>
      path === "/user/address" ? address.promise : cards.promise,
    );
    vi.spyOn(api, "post").mockResolvedValue({ token: "bob-token", email: "bob@example.com" });
    const store = createTestStore();
    seedPrivateState(store);
    const oldAddresses = store.dispatch(fetchAddresses());
    const oldCards = store.dispatch(fetchCreditCards());

    await store.dispatch(loginUser({ email: "bob@example.com", password: "Password1!", rememberMe: false }));
    address.resolve([{ id: 1, title: "Alice's address" }]);
    cards.resolve([{ id: 1, card_no: "1234123412341234" }]);
    await Promise.all([oldAddresses, oldCards]);

    expect(store.getState().client.user.email).toBe("bob@example.com");
    expect(store.getState().client.addressList).toEqual([]);
    expect(store.getState().client.creditCards).toEqual([]);
    expect(store.getState().shoppingCart.payment).toEqual({});
  });
});

describe("stored-session verification", () => {
  it("uses a timeout that can accommodate the observed Render cold start", () => {
    expect(API_TIMEOUT_MS).toBe(150_000);
    expect(api.defaults.timeout).toBe(API_TIMEOUT_MS);
  });

  it("renews a valid token and sets the authenticated user", async () => {
    window.localStorage.setItem("token", "old-token");
    vi.spyOn(api, "get").mockResolvedValue({ token: "new-token", email: "alice@example.com" });
    const store = createTestStore();

    const result = await store.dispatch(verifyStoredSession());

    expect(result.authenticated).toBe(true);
    expect(window.localStorage.getItem("token")).toBe("new-token");
    expect(api.defaults.headers.common.Authorization).toBe("new-token");
    expect(store.getState().client.user.email).toBe("alice@example.com");
    expect(store.getState().client.authInitialized).toBe(true);
  });

  it("removes an unauthorized token and private state on HTTP 401", async () => {
    window.localStorage.setItem("token", "invalid-token");
    vi.spyOn(api, "get").mockRejectedValue({ status: 401, message: "Unauthorized" });
    const store = createTestStore();
    seedPrivateState(store);

    const result = await store.dispatch(verifyStoredSession());

    expect(result.authenticated).toBe(false);
    expect(window.localStorage.getItem("token")).toBeNull();
    expect(api.defaults.headers.common.Authorization).toBeUndefined();
    expect(store.getState().client.user).toEqual({});
    expect(store.getState().client.addressList).toEqual([]);
    expect(store.getState().client.creditCards).toEqual([]);
    expect(store.getState().shoppingCart.payment).toEqual({});
    expect(store.getState().client.authInitialized).toBe(true);
  });

  it.each([
    ["timeout", { code: "ECONNABORTED", message: "timeout" }],
    ["network error", { code: "ERR_NETWORK", message: "Network Error" }],
    ["HTTP 500", { status: 500, message: "Server unavailable" }],
  ])("retains the token after a %s", async (_label, error) => {
    window.localStorage.setItem("token", "remembered-token");
    vi.spyOn(api, "get").mockRejectedValue(error);
    const store = createTestStore();

    const result = await store.dispatch(verifyStoredSession());

    expect(result).toMatchObject({ authenticated: false, transient: true });
    expect(window.localStorage.getItem("token")).toBe("remembered-token");
    expect(api.defaults.headers.common.Authorization).toBe("remembered-token");
    expect(store.getState().client.user).toEqual({});
    expect(store.getState().client.authVerificationError).toBe(true);
    expect(store.getState().client.authInitialized).toBe(true);
  });

  it("retries after a transient failure without discarding the saved login", async () => {
    window.localStorage.setItem("token", "remembered-token");
    vi.spyOn(api, "get")
      .mockRejectedValueOnce({ code: "ERR_NETWORK", message: "Network Error" })
      .mockResolvedValueOnce({ token: "renewed-token", email: "alice@example.com" });
    const store = createTestStore();

    await store.dispatch(verifyStoredSession());
    const result = await store.dispatch(verifyStoredSession());

    expect(result.authenticated).toBe(true);
    expect(window.localStorage.getItem("token")).toBe("renewed-token");
    expect(store.getState().client.authVerificationError).toBe(false);
  });

  it("deduplicates simultaneous verification attempts", async () => {
    window.localStorage.setItem("token", "remembered-token");
    const verification = deferred();
    const get = vi.spyOn(api, "get").mockReturnValue(verification.promise);
    const store = createTestStore();

    const first = store.dispatch(verifyStoredSession());
    const second = store.dispatch(verifyStoredSession());
    expect(get).toHaveBeenCalledTimes(1);

    verification.resolve({ token: "renewed-token", email: "alice@example.com" });
    await Promise.all([first, second]);
    expect(store.getState().client.user.email).toBe("alice@example.com");
  });

  it("ignores a verify response that arrives after logout", async () => {
    window.localStorage.setItem("token", "old-token");
    const verification = deferred();
    vi.spyOn(api, "get").mockReturnValue(verification.promise);
    const store = createTestStore();

    const pending = store.dispatch(verifyStoredSession());
    store.dispatch(logoutUser());
    verification.resolve({ token: "renewed-old-token", email: "alice@example.com" });
    const result = await pending;

    expect(result).toMatchObject({ authenticated: false, stale: true });
    expect(window.localStorage.getItem("token")).toBeNull();
    expect(api.defaults.headers.common.Authorization).toBeUndefined();
    expect(store.getState().client.user).toEqual({});
  });
});

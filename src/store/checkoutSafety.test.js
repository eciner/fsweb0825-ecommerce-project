// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { applyMiddleware, legacy_createStore } from "redux";
import { thunk } from "redux-thunk";
import reducer from "./reducer";
import api, { clearAuthToken } from "../services/api";
import {
  addCartItem,
  createOrder,
  loginUser,
  logoutUser,
  resetAccountSession,
  restorePendingCheckout,
  setUser,
  invalidateProductInventory,
} from "./actions";
import {
  CHECKOUT_OPEN,
  CHECKOUT_FAILED,
  CHECKOUT_CONFIRMED,
} from "./checkoutState";

const first = "first@example.test",
  second = "second@example.test";
const payload = (key = "a0000000-0000-4000-8000-000000000001") => ({
  request_id: key,
  address_id: 1,
  receipt_address_id: 2,
  order_date: "2026-10-17T00:00:00.000Z",
  price: 10,
  products: [{ product_id: 1, count: 1, detail: "" }],
});
const other = () => payload("b0000000-0000-4000-8000-000000000002");
const pending = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
function store(account = first) {
  const result = legacy_createStore(reducer, applyMiddleware(thunk));
  result.dispatch(setUser({ email: account }));
  result.dispatch(addCartItem({ id: 1, price: 10 }));
  result.dispatch(addCartItem({ id: 1, price: 10 }));
  return result;
}
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
afterEach(() => {
  vi.restoreAllMocks();
  clearAuthToken();
});

it("preserves lost-response identity through 401, reauthentication and same-payload recovery", async () => {
  const state = store();
  const post = vi
    .spyOn(api, "post")
    .mockRejectedValueOnce({ message: "Response lost" })
    .mockRejectedValueOnce({ status: 401 });
  await expect(
    state.dispatch(
      createOrder(payload(), { purchased: [{ productId: 1, count: 1 }] }),
    ),
  ).rejects.toBeTruthy();
  const original = state.getState().shoppingCart.orderIntent.payload;
  await expect(state.dispatch(createOrder(original))).rejects.toMatchObject({
    status: 401,
  });
  expect(state.getState().shoppingCart.orderIntent).toMatchObject({
    status: "AUTH_REQUIRED",
    uncertain: true,
    payload: original,
  });
  await expect(state.dispatch(createOrder(other()))).rejects.toBeTruthy();
  expect(post).toHaveBeenCalledTimes(2);
  post.mockResolvedValueOnce({
    email: first,
    token: "synthetic-session-token",
  });
  await state.dispatch(
    loginUser({ email: first, password: "Synthetic-only", rememberMe: false }),
  );
  state.dispatch(restorePendingCheckout());
  expect(state.getState().shoppingCart.orderIntent.payload).toEqual(original);
  post.mockResolvedValueOnce({ id: 71, products: [], price: 10 });
  await state.dispatch(createOrder());
  expect(
    post.mock.calls
      .filter(([path]) => path === "/order")
      .map(([, body]) => body),
  ).toEqual([original, original, original]);
  expect(state.getState().shoppingCart.checkoutResult.status).toBe("RECOVERED");
  expect(state.getState().shoppingCart.orderIntent).toBeNull();
  expect(state.getState().shoppingCart.cart[0].count).toBe(1);
  expect(sessionStorage.getItem("fsweb0825.pending-order")).toBeNull();
});

it("requires authentication on a first-attempt 401 without claiming an earlier commit", async () => {
  const state = store();
  vi.spyOn(api, "post").mockRejectedValue({ status: 401 });
  await expect(state.dispatch(createOrder(payload()))).rejects.toMatchObject({
    status: 401,
  });
  expect(state.getState().shoppingCart.orderIntent).toMatchObject({
    status: "AUTH_REQUIRED",
    uncertain: false,
    payload: payload(),
  });
  expect(state.getState().shoppingCart.checkoutResult).toBeNull();
});

it.each([400, 404, 409])(
  "clears a conclusive first-attempt rejection %i without consuming cart or invalidating inventory",
  async (status) => {
    const state = store();
    vi.spyOn(api, "post").mockRejectedValue({
      status,
      code: "INSUFFICIENT_STOCK",
      message: "Rejected before commit",
    });
    const cart = state.getState().shoppingCart.cart;
    await expect(state.dispatch(createOrder(payload()))).rejects.toMatchObject({
      status,
    });
    expect(state.getState().shoppingCart.orderIntent).toBeNull();
    expect(state.getState().shoppingCart.checkoutResult.status).toBe(
      "REJECTED",
    );
    expect(state.getState().shoppingCart.cart).toEqual(cart);
    expect(state.getState().product.inventoryRevision).toBe(0);
    expect(sessionStorage.getItem("fsweb0825.pending-order")).toBeNull();
  },
);

it.each([undefined, 500, 503, 408, 429])(
  "retains uncertainty after transport/server failure %s and a later validation rejection",
  async (status) => {
    const state = store();
    const post = vi
      .spyOn(api, "post")
      .mockRejectedValueOnce({ status })
      .mockRejectedValueOnce({ status: 400 });
    await expect(state.dispatch(createOrder(payload()))).rejects.toBeTruthy();
    expect(state.getState().shoppingCart.orderIntent.status).toBe(
      "INDETERMINATE",
    );
    await expect(state.dispatch(createOrder())).rejects.toMatchObject({
      status: 400,
    });
    expect(state.getState().shoppingCart.orderIntent).toMatchObject({
      status: "UNRESOLVED",
      uncertain: true,
      payload: payload(),
    });
    await expect(state.dispatch(createOrder(other()))).rejects.toBeTruthy();
    expect(post).toHaveBeenCalledTimes(2);
  },
);

it("retains same-key conflict for user reconciliation and never substitutes a new key", async () => {
  const state = store();
  const post = vi
    .spyOn(api, "post")
    .mockRejectedValue({ status: 409, code: "ORDER_REQUEST_CONFLICT" });
  await expect(state.dispatch(createOrder(payload()))).rejects.toBeTruthy();
  expect(state.getState().shoppingCart.orderIntent.status).toBe("UNRESOLVED");
  await expect(state.dispatch(createOrder(other()))).rejects.toBeTruthy();
  expect(post).toHaveBeenCalledTimes(1);
});

it("copies immutable request data, blocks overlapping submits and settles each identity once", async () => {
  const state = store();
  const response = pending();
  const post = vi.spyOn(api, "post").mockReturnValue(response.promise);
  const input = payload();
  const operation = state.dispatch(
    createOrder(input, { purchased: [{ productId: 1, count: 1 }] }),
  );
  const { scope, attempt } = state.getState().shoppingCart.orderIntent;
  input.products[0].count = 7;
  expect(post.mock.calls[0][1].products[0].count).toBe(1);
  expect(() => {
    post.mock.calls[0][1].products[0].count = 9;
  }).toThrow();
  await expect(state.dispatch(createOrder())).rejects.toBeTruthy();
  expect(post).toHaveBeenCalledTimes(1);
  response.resolve({ id: 9 });
  await operation;
  const settled = state.getState();
  expect(await state.dispatch(createOrder(payload()))).toEqual({ id: 9 });
  expect(post).toHaveBeenCalledTimes(1);
  state.dispatch({
    type: CHECKOUT_CONFIRMED,
    payload: { scope, attempt, order: { id: 9 } },
  });
  state.dispatch({
    type: "CART_COMPLETE_PURCHASE",
    payload: [{ productId: 1, count: 1 }],
    scope,
    attempt,
  });
  state.dispatch(invalidateProductInventory(scope, attempt));
  expect(state.getState()).toBe(settled);
  expect(settled.shoppingCart.cart[0].count).toBe(1);
  expect(settled.product.inventoryRevision).toBe(1);
});

for (const storage of [true, false])
  for (const outcome of ["success", 400, 401, 500, "network"])
    it(`ignores account A's delayed ${outcome} while B is submitting (storage=${storage})`, async () => {
      if (!storage)
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
          throw new Error("Unavailable");
        });
      const state = store();
      const a = pending(),
        b = pending();
      vi.spyOn(api, "post")
        .mockReturnValueOnce(a.promise)
        .mockReturnValueOnce(b.promise);
      const firstAttempt = state.dispatch(
        createOrder(payload(), { purchased: [{ productId: 1, count: 1 }] }),
      );
      const old = state.getState().shoppingCart.orderIntent;
      state.dispatch(logoutUser());
      state.dispatch(setUser({ email: second }));
      const nextAttempt = state.dispatch(
        createOrder(other(), { purchased: [{ productId: 1, count: 1 }] }),
      );
      const before = structuredClone(state.getState());
      const saved = sessionStorage.getItem("fsweb0825.pending-order");
      if (outcome === "success") a.resolve({ id: 1 });
      else a.reject({ status: outcome === "network" ? undefined : outcome });
      expect(await firstAttempt).toEqual({ stale: true });
      expect(state.getState()).toEqual(before);
      expect(sessionStorage.getItem("fsweb0825.pending-order")).toBe(saved);
      state.dispatch({ type: "ORDER_INTENT", payload: null });
      state.dispatch({
        type: CHECKOUT_FAILED,
        payload: {
          scope: old.scope,
          attempt: old.attempt,
          failure: { status: "REJECTED" },
        },
      });
      state.dispatch({
        type: "CART_COMPLETE_PURCHASE",
        payload: [{ productId: 1, count: 1 }],
        scope: old.scope,
        attempt: old.attempt,
      });
      state.dispatch(invalidateProductInventory(old.scope, old.attempt));
      expect(state.getState()).toEqual(before);
      b.reject({ message: "B response lost" });
      await expect(nextAttempt).rejects.toBeTruthy();
      state.dispatch(resetAccountSession());
      state.dispatch(setUser({ email: first }));
      state.dispatch(restorePendingCheckout());
      expect(state.getState().shoppingCart.orderIntent.payload).toEqual(
        payload(),
      );
    });

it("restores only the authenticated account after reload without consuming a new cart", async () => {
  const state = store();
  vi.spyOn(api, "post").mockRejectedValue({ message: "Lost" });
  await expect(state.dispatch(createOrder(payload()))).rejects.toBeTruthy();
  const wrong = store(second);
  wrong.dispatch(restorePendingCheckout());
  expect(wrong.getState().shoppingCart.orderIntent).toBeNull();
  const reloaded = store();
  reloaded.dispatch(restorePendingCheckout());
  expect(reloaded.getState().shoppingCart.orderIntent.payload).toEqual(
    payload(),
  );
  expect(reloaded.getState().shoppingCart.orderIntent.purchased).toEqual([]);
  const current = reloaded.getState().shoppingCart.orderIntent;
  reloaded.dispatch({
    type: CHECKOUT_OPEN,
    payload: {
      scope: { ...current.scope, requestId: other().request_id },
      intent: { ...current, payload: other() },
    },
  });
  expect(reloaded.getState().shoppingCart.orderIntent).toBe(current);
});

it("starts a new session epoch even for a direct authenticated account replacement", async () => {
  const state = store();
  const response = pending();
  vi.spyOn(api, "post").mockReturnValue(response.promise);
  const operation = state.dispatch(createOrder(payload()));
  state.dispatch(setUser({ email: second }));
  expect(state.getState().client.sessionRevision).toBe(1);
  expect(state.getState().shoppingCart.orderIntent).toBeNull();
  const before = structuredClone(state.getState());
  response.resolve({ id: 1 });
  expect(await operation).toEqual({ stale: true });
  expect(state.getState()).toEqual(before);
});

it("rejects a stale attempt and cannot turn an uncertain intent into a conclusive failure", async () => {
  const state = store();
  const response = pending();
  vi.spyOn(api, "post")
    .mockRejectedValueOnce({ message: "Lost" })
    .mockReturnValueOnce(response.promise);
  await expect(state.dispatch(createOrder(payload()))).rejects.toBeTruthy();
  const operation = state.dispatch(createOrder());
  const current = state.getState();
  const intent = current.shoppingCart.orderIntent;
  state.dispatch({
    type: CHECKOUT_FAILED,
    payload: {
      scope: intent.scope,
      attempt: intent.attempt - 1,
      failure: { status: "REJECTED", uncertain: false },
    },
  });
  expect(state.getState()).toBe(current);
  state.dispatch({
    type: CHECKOUT_FAILED,
    payload: {
      scope: intent.scope,
      attempt: intent.attempt,
      failure: { status: "REJECTED", uncertain: false },
    },
  });
  expect(state.getState()).toBe(current);
  response.resolve({ id: 3 });
  await operation;
});

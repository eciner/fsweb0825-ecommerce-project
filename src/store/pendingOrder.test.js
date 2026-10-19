// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { rememberOrder, recoverOrder, forgetOrder } from "./pendingOrder";
afterEach(() => sessionStorage.clear());
it("persists only typed order metadata and scopes recovery to the same account", () => {
  const payload = {
    request_id: "a0000000-0000-4000-8000-000000000001",
    address_id: 1,
    receipt_address_id: 2,
    order_date: "2026-10-17T00:00:00Z",
    price: 10,
    products: [{ product_id: 1, count: 1, detail: "" }],
    card_no: "4111111111111111",
    card_ccv: "123",
    token: "private",
  };
  expect(rememberOrder("First@Example.test", { payload })).toBe(true);
  const saved = sessionStorage.getItem("fsweb0825.pending-order");
  expect(saved).not.toContain("4111111111111111");
  expect(saved).not.toContain("card_ccv");
  expect(saved).not.toContain("token");
  expect(recoverOrder("other@example.test")).toBeNull();
  expect(recoverOrder("first@example.test").payload.request_id).toBe(
    payload.request_id,
  );
  expect(recoverOrder("first@example.test").purchased).toEqual([]);
  forgetOrder("other@example.test");
  expect(recoverOrder("first@example.test")).not.toBeNull();
  forgetOrder();
  expect(recoverOrder("first@example.test")).toBeNull();
});
it("does not recover corrupted or invalid pending intents", () => {
  for (const value of [
    "broken",
    JSON.stringify({
      account: "first@example.test",
      payload: { request_id: "bad", address_id: 1, products: [] },
    }),
  ]) {
    sessionStorage.setItem("fsweb0825.pending-order", value);
    expect(recoverOrder("first@example.test")).toBeNull();
  }
});

it("keeps accounts separate and removes only the matching resolved UUID", () => {
  const payload = {
    request_id: "a0000000-0000-4000-8000-000000000001",
    address_id: 1,
    products: [
      {
        product_id: 1,
        count: 1,
        detail: "",
        password: "excluded",
        card_ccv: "excluded",
      },
    ],
    password: "excluded",
    jwt: "excluded",
    cvv: "excluded",
  };
  rememberOrder("first@example.test", { payload });
  const other = {
    ...payload,
    request_id: "b0000000-0000-4000-8000-000000000002",
  };
  rememberOrder("second@example.test", { payload: other });
  forgetOrder("first@example.test", other.request_id);
  expect(recoverOrder("first@example.test").payload.request_id).toBe(
    payload.request_id,
  );
  expect(recoverOrder("second@example.test").payload.request_id).toBe(
    other.request_id,
  );
  expect(sessionStorage.getItem("fsweb0825.pending-order")).not.toContain(
    "excluded",
  );
  forgetOrder("first@example.test", payload.request_id);
  expect(recoverOrder("first@example.test")).toBeNull();
  expect(recoverOrder("second@example.test")).not.toBeNull();
});

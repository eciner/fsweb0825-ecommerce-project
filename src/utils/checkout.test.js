import { describe, expect, it } from "vitest";

import { isCheckoutReady } from "./checkout";

const validCheckout = {
  shippingAddress: { id: 1 },
  receiptAddress: { id: 2 },
  card: { id: 3 },
  ccv: "321",
  cart: [{ product: { id: 4 }, count: 1, checked: true }],
};

describe("checkout readiness", () => {
  it("allows checkout when all prerequisites are valid", () => {
    expect(isCheckoutReady(validCheckout)).toBe(true);
  });

  it.each([
    ["missing shipping address", { shippingAddress: null }],
    ["shipping address without identity", { shippingAddress: {} }],
    ["missing receipt address", { receiptAddress: null }],
    ["receipt address without identity", { receiptAddress: {} }],
    ["missing saved card", { card: null }],
    ["saved card without identity", { card: {} }],
    ["empty CCV", { ccv: "" }],
    ["one-digit CCV", { ccv: "1" }],
    ["two-digit CCV", { ccv: "12" }],
    ["non-numeric CCV", { ccv: "abc" }],
    ["mixed CCV", { ccv: "12a" }],
    ["five-digit CCV", { ccv: "12345" }],
    ["empty cart", { cart: [] }],
    ["no selected product", { cart: [{ ...validCheckout.cart[0], checked: false }] }],
    ["submission in progress", { submitting: true }],
  ])("prevents checkout with %s", (_reason, changes) => {
    expect(isCheckoutReady({ ...validCheckout, ...changes })).toBe(false);
  });

  it.each(["321", "4321"])("accepts a valid %s CCV", (ccv) => {
    expect(isCheckoutReady({ ...validCheckout, ccv })).toBe(true);
  });
});

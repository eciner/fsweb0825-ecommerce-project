import { describe, expect, it } from "vitest";

import { redactForLogger } from "./redactForLogger";

describe("Redux Logger redaction", () => {
  it("redacts sensitive fields in nested actions without changing the action", () => {
    const action = {
      type: "CHECKOUT",
      payload: {
        card_no: "1234123412341234",
        card_ccv: "321",
        ccv: "321",
        cvv: "321",
        cvc: "321",
        password: "secret-password",
        access_token: "jwt-value",
        products: [{ product_id: 7, count: 2 }],
      },
    };

    const logged = redactForLogger(action);

    for (const key of ["card_no", "card_ccv", "ccv", "cvv", "cvc", "password", "access_token"]) {
      expect(logged.payload[key]).toBe("[REDACTED]");
    }
    expect(logged.payload.products).toEqual([{ product_id: 7, count: 2 }]);
    expect(action.payload.card_no).toBe("1234123412341234");
  });

  it("redacts saved cards and checkout state while preserving non-JSON values", () => {
    const created = new Date("2026-09-27T00:00:00Z");
    const state = {
      client: { creditCards: [{ card_no: "1234123412341234" }] },
      shoppingCart: { payment: { cardNumber: "9876987698769876", cvv: "123" } },
      request: { headers: { Authorization: "raw-jwt" } },
      created,
    };

    const logged = redactForLogger(state);

    expect(logged.client.creditCards[0].card_no).toBe("[REDACTED]");
    expect(logged.shoppingCart.payment.cardNumber).toBe("[REDACTED]");
    expect(logged.shoppingCart.payment.cvv).toBe("[REDACTED]");
    expect(logged.request.headers.Authorization).toBe("[REDACTED]");
    expect(logged.created).toBe(created);
    expect(state.client.creditCards[0].card_no).toBe("1234123412341234");
  });
});

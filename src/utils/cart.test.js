import { describe, expect, it } from "vitest";

import { buildOrderPayload, calculateCartTotals, getCartLineTotal } from "./cart";

const product = { id: 12, price: 10 };

describe("cart calculations", () => {
  it("includes count in line totals and excludes unchecked lines", () => {
    expect(getCartLineTotal({ product, count: 3 })).toBe(30);
    expect(
      calculateCartTotals([
        { product, count: 3, checked: true },
        { product: { id: 13, price: 50 }, count: 1, checked: false },
      ]),
    ).toEqual({ productsTotal: 30, shipping: 0, discount: 0, grandTotal: 30 });
  });

  it("calculates explicit shipping, discount, and grand total", () => {
    expect(calculateCartTotals([{ product, count: 2, checked: true }], 5, 3)).toEqual({
      productsTotal: 20,
      shipping: 5,
      discount: 3,
      grandTotal: 22,
    });
  });

  it("builds an order from selected items without fabricated variants", () => {
    const payload = buildOrderPayload({
      addressId: 4,
      card: { card_no: "1234", name_on_card: "A User", expire_month: 2, expire_year: 2030 },
      ccv: "321",
      cart: [
        { product, count: 2, checked: true },
        { product: { id: 13, price: 9 }, count: 1, checked: false },
      ],
      price: 20,
      orderDate: "2026-01-01T00:00:00.000Z",
    });

    expect(payload.products).toEqual([{ product_id: 12, count: 2, detail: "" }]);
    expect(payload.address_id).toBe(4);
    expect(payload.card_ccv).toBe("321");
  });
});
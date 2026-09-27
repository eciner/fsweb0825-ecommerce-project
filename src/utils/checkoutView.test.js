import { describe, expect, it } from "vitest";

import reducer from "../store/reducer";
import { addCartItem, resetCart } from "../store/actions";
import { getCheckoutView } from "./checkoutView";

describe("checkout view after order completion", () => {
  it("shows confirmation after the successful order clears the cart", () => {
    const withCart = reducer(undefined, addCartItem({ id: 7 }));
    const afterSuccess = reducer(withCart, resetCart());

    expect(afterSuccess.shoppingCart.cart).toEqual([]);
    expect(getCheckoutView(3, afterSuccess.shoppingCart.cart.length)).toBe("success");
    expect(getCheckoutView(2, afterSuccess.shoppingCart.cart.length)).toBe("empty");
  });

  it("keeps the checkout form and cart available after a failed order", () => {
    const withCart = reducer(undefined, addCartItem({ id: 7 }));

    expect(withCart.shoppingCart.cart).toHaveLength(1);
    expect(getCheckoutView(2, withCart.shoppingCart.cart.length)).toBe("form");
  });
});

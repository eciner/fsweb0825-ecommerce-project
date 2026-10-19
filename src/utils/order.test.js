import { expect, it } from "vitest";
import { formatOrderPrice } from "./order";

it("uses recorded server currency and discloses absent historical values", () => {
  expect(formatOrderPrice(599.8, "USD")).toBe("$599.80");
  expect(formatOrderPrice(599.8)).toContain("currency not recorded");
  expect(formatOrderPrice(undefined, "USD")).toBe("Amount unavailable");
  expect(formatOrderPrice(null, "USD")).toBe("Amount unavailable");
});

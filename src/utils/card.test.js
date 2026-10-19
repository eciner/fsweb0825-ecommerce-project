import { describe, expect, it } from "vitest";

import { isCardExpired } from "./card";

describe("isCardExpired", () => {
  const currentDate = new Date(2026, 8, 15);

  it("rejects an earlier month in the current year", () => {
    expect(isCardExpired(5, 2026, currentDate)).toBe(true);
  });

  it("accepts the current month and rejects out-of-range months", () => {
    expect(isCardExpired(9, 2026, currentDate)).toBe(false);
    expect(isCardExpired(13, 2027, currentDate)).toBe(true);
    expect(isCardExpired(0, 2027, currentDate)).toBe(true);
  });

  it("accepts a later month in the current year", () => {
    expect(isCardExpired(10, 2026, currentDate)).toBe(false);
  });

  it("rejects a previous year and invalid values", () => {
    expect(isCardExpired(12, 2025, currentDate)).toBe(true);
    expect(isCardExpired("", 2026, currentDate)).toBe(true);
  });
});

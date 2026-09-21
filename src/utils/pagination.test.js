import { describe, expect, it } from "vitest";

import {
  buildPaginationWindow,
  calculateOffset,
  calculatePageCount,
  normalizePage,
} from "./pagination";

describe("pagination utilities", () => {
  it("calculates offset and page count", () => {
    expect(calculateOffset(1, 25)).toBe(0);
    expect(calculateOffset(3, 25)).toBe(50);
    expect(calculatePageCount(73, 25)).toBe(3);
  });

  it("normalizes invalid pages", () => {
    expect(normalizePage("-1", 5)).toBe(1);
    expect(normalizePage("100", 3)).toBe(3);
    expect(normalizePage("abc", 3)).toBe(1);
    expect(normalizePage(2, 0)).toBe(1);
  });

  it("builds compact page window with ellipsis", () => {
    expect(buildPaginationWindow(10, 24)).toEqual([1, "...", 9, 10, 11, "...", 24]);
  });
});

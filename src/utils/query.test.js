import { describe, expect, it } from "vitest";

import {
  buildProductsParams,
  buildShopSearch,
  createQueryKey,
  normalizeQuery,
  readShopSearch,
} from "./query";

describe("query utilities", () => {
  it("normalizes empty query values", () => {
    expect(normalizeQuery({})).toEqual({
      category: null,
      sort: "",
      filter: "",
      limit: 25,
      offset: 0,
    });
  });

  it("trims filter and keeps valid sort/category", () => {
    expect(
      normalizeQuery({
        category: "2",
        sort: "price:desc",
        filter: "  siyah  ",
        limit: "25",
        offset: "50",
      }),
    ).toEqual({
      category: 2,
      sort: "price:desc",
      filter: "siyah",
      limit: 25,
      offset: 50,
    });
  });

  it("drops unsupported sort and invalid paging values", () => {
    expect(
      normalizeQuery({
        category: "-1",
        sort: "newest",
        filter: "",
        limit: "0",
        offset: "-5",
      }),
    ).toEqual({
      category: null,
      sort: "",
      filter: "",
      limit: 25,
      offset: 0,
    });
  });

  it("builds API params while omitting empty optional fields", () => {
    expect(
      buildProductsParams({ category: null, sort: "", filter: "", limit: 25, offset: 0 }),
    ).toEqual({ limit: 25, offset: 0 });

    expect(
      buildProductsParams({ category: 2, sort: "price:asc", filter: "siyah", limit: 25, offset: 25 }),
    ).toEqual({
      category: 2,
      sort: "price:asc",
      filter: "siyah",
      limit: 25,
      offset: 25,
    });
  });

  it("creates deterministic query key", () => {
    const one = createQueryKey({ category: 2, sort: "price:desc", filter: "siyah", limit: 25, offset: 25 });
    const two = createQueryKey({ category: "2", sort: "price:desc", filter: "  siyah ", limit: "25", offset: "25" });
    expect(one).toEqual(two);
  });

  it("parses and builds shop search consistently", () => {
    const parsed = readShopSearch("?filter=siyah&sort=price%3Adesc&page=2");
    expect(parsed).toEqual({ sort: "price:desc", filter: "siyah", page: 2 });

    const search = buildShopSearch(parsed);
    expect(search).toContain("sort=price%3Adesc");
    expect(search).toContain("filter=siyah");
    expect(search).toContain("page=2");
  });
});

import { describe, expect, it } from "vitest";

import { getProductDetailRouteState } from "./productDetailRoute";

const productA = { id: 1, name: "Product A", category_id: 10 };
const productB = { id: 2, name: "Product B", category_id: 20 };

describe("product detail route identity", () => {
  it("allows a fetched product to render and canonicalize its own route", () => {
    const view = getProductDetailRouteState({
      routeProductId: 1,
      selectedProductId: 1,
      selectedProduct: productA,
      fetchState: "FETCHED",
    });

    expect(view).toMatchObject({
      currentProduct: productA,
      isLoading: false,
      isFailed: false,
      canCanonicalize: true,
    });
  });

  it("hides fetched A and bars A's canonical redirect when the route changes to B", () => {
    const view = getProductDetailRouteState({
      routeProductId: 2,
      selectedProductId: 1,
      selectedProduct: productA,
      fetchState: "FETCHED",
    });

    expect(view.currentProduct).toBeNull();
    expect(view.isLoading).toBe(true);
    expect(view.canCanonicalize).toBe(false);
  });

  it("shows loading after B starts without exposing A", () => {
    const view = getProductDetailRouteState({
      routeProductId: 2,
      selectedProductId: 2,
      selectedProduct: {},
      fetchState: "FETCHING",
    });

    expect(view.currentProduct).toBeNull();
    expect(view.isLoading).toBe(true);
    expect(view.canCanonicalize).toBe(false);
  });

  it("allows B to render and canonicalize only after B is fetched", () => {
    const view = getProductDetailRouteState({
      routeProductId: 2,
      selectedProductId: 2,
      selectedProduct: productB,
      fetchState: "FETCHED",
    });

    expect(view.currentProduct).toBe(productB);
    expect(view.isLoading).toBe(false);
    expect(view.canCanonicalize).toBe(true);
  });

  it("never exposes a selected product for an invalid route ID", () => {
    const view = getProductDetailRouteState({
      routeProductId: NaN,
      selectedProductId: 1,
      selectedProduct: productA,
      fetchState: "FETCHED",
    });

    expect(view.currentProduct).toBeNull();
    expect(view.canCanonicalize).toBe(false);
  });

  it("shows only current-route failures, including invalid ID and 404", () => {
    const oldFailure = getProductDetailRouteState({
      routeProductId: 2,
      selectedProductId: 1,
      selectedProduct: {},
      fetchState: "FAILED",
      error: { status: 404 },
    });
    const currentFailure = getProductDetailRouteState({
      routeProductId: 2,
      selectedProductId: 2,
      selectedProduct: {},
      fetchState: "FAILED",
      error: { status: 404 },
    });
    const invalidId = getProductDetailRouteState({
      routeProductId: NaN,
      selectedProductId: null,
      selectedProduct: {},
      fetchState: "FAILED",
      error: { status: 400, code: "INVALID_PRODUCT_ID" },
    });

    expect(oldFailure).toMatchObject({ isLoading: true, isFailed: false });
    expect(currentFailure).toMatchObject({ isLoading: false, isFailed: true });
    expect(invalidId).toMatchObject({ isLoading: false, isFailed: true });
  });
});

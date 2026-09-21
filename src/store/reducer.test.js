import { describe, expect, it } from "vitest";

import reducer from "./reducer";
import {
  PRODUCT_DETAIL_FETCH_FAILED,
  PRODUCT_DETAIL_FETCH_STARTED,
  PRODUCT_DETAIL_FETCH_SUCCEEDED,
  PRODUCT_LIST_FETCH_FAILED,
  PRODUCT_LIST_FETCH_STARTED,
  PRODUCT_LIST_FETCH_SUCCEEDED,
} from "./actions";

describe("product reducer", () => {
  it("tracks list request lifecycle", () => {
    const startState = reducer(undefined, {
      type: PRODUCT_LIST_FETCH_STARTED,
      payload: {
        query: { category: 2, sort: "", filter: "", limit: 25, offset: 0 },
        queryKey: "q1",
        requestId: 1,
      },
    });

    expect(startState.product.fetchState).toBe("FETCHING");
    expect(startState.product.activeQueryKey).toBe("q1");

    const successState = reducer(startState, {
      type: PRODUCT_LIST_FETCH_SUCCEEDED,
      payload: {
        products: [],
        total: 0,
        query: { category: 2, sort: "", filter: "", limit: 25, offset: 0 },
        queryKey: "q1",
        requestId: 1,
      },
    });

    expect(successState.product.fetchState).toBe("FETCHED");
    expect(successState.product.lastSuccessfulQueryKey).toBe("q1");
  });

  it("ignores stale list response", () => {
    const state = reducer(undefined, {
      type: PRODUCT_LIST_FETCH_STARTED,
      payload: {
        query: { category: 2, sort: "", filter: "", limit: 25, offset: 0 },
        queryKey: "q-new",
        requestId: 5,
      },
    });

    const stale = reducer(state, {
      type: PRODUCT_LIST_FETCH_FAILED,
      payload: {
        error: { message: "old", status: 500, code: null },
        query: { category: 1, sort: "", filter: "", limit: 25, offset: 0 },
        queryKey: "q-old",
        requestId: 4,
      },
    });

    expect(stale.product.fetchState).toBe("FETCHING");
    expect(stale.product.productListError).toBeNull();
  });

  it("tracks detail request lifecycle", () => {
    const started = reducer(undefined, {
      type: PRODUCT_DETAIL_FETCH_STARTED,
      payload: { productId: 322, requestId: 7 },
    });

    expect(started.product.selectedProductFetchState).toBe("FETCHING");

    const succeeded = reducer(started, {
      type: PRODUCT_DETAIL_FETCH_SUCCEEDED,
      payload: { product: { id: 322 }, productId: 322, requestId: 7 },
    });

    expect(succeeded.product.selectedProductFetchState).toBe("FETCHED");
    expect(succeeded.product.selectedProduct.id).toBe(322);

    const failed = reducer(started, {
      type: PRODUCT_DETAIL_FETCH_FAILED,
      payload: {
        error: { message: "not found", status: 404, code: null },
        productId: 322,
        requestId: 7,
      },
    });

    expect(failed.product.selectedProductFetchState).toBe("FAILED");
    expect(failed.product.selectedProductError.status).toBe(404);
  });
});

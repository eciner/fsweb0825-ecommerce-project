# Project Progress

## Status Through T23 (Re-audited)

- Completed and verified locally: T01-T23
- Live authenticated address/card/order endpoint verification requires a valid test session token.
- Postman request coverage exists for all checkout/order endpoints; no test account data was created solely for this audit.

## Verified Highlights

- T08-T11: Signup/Login/Remember Me/Verify lifecycle implemented with Redux thunks and token lifecycle (`Authorization: token`, no `Bearer`).
- Signup validation rejects whitespace-only names, normalizes Turkish store phone/tax/IBAN fields, validates Turkish IBAN checksum, and exposes role-load retry.
- Login/verify preserve the real user response fields in Redux while excluding token fields.
- Header exposes logout on desktop and mobile.
- T12-T13: Categories and products fetched from API and stored in Redux with loading/error/empty states.
- T14: Canonical query model implemented (`category`, `sort`, `filter`, `limit`, `offset`) with URL synchronization and parameter preservation.
- T15: Numbered pagination implemented with `limit=25`, `offset=(page-1)*limit`, URL `page` param, and accessible controls.
- T16: Product detail route and API-backed detail fetch implemented:
  - `/shop/:gender/:categoryName/:categoryId/:productNameSlug/:productId`
  - direct refresh works
  - loading/error/retry/back states
  - stale request protection
  - no local-product fallback substitution

## Architecture Decisions

- Route/search params are navigation source of truth.
- Redux stores normalized request/response state and fetch states.
- Product list and product detail requests are separated:
  - list fetch state: `fetchState`
  - detail fetch state: `selectedProductFetchState`
- Request deduplication is keyed:
  - list requests by query key
  - detail requests by product id
- Stale response protection uses request ids stored in Redux.

## Canonical Product State (current)

```js
{
  product: {
    categories: [],
    productList: [],
    total: 0,
    limit: 25,
    offset: 0,
    filter: "",
    sort: "",
    fetchState: "NOT_FETCHED" | "FETCHING" | "FETCHED" | "FAILED",
    productListError: null | { message, status, code },

    activeQuery: { category, sort, filter, limit, offset },
    activeQueryKey: "",
    lastSuccessfulQueryKey: "",
    activeListRequestId: null,

    selectedProduct: {},
    selectedProductId: null,
    selectedProductFetchState: "NOT_FETCHED" | "FETCHING" | "FETCHED" | "FAILED",
    selectedProductError: null | { message, status, code },
    activeDetailRequestId: null,

    categoriesFetchState: "NOT_FETCHED" | "FETCHING" | "FETCHED" | "FAILED",
    categoriesError: null | { message, status, code }
  }
}
```

## Notes

- T17 cart behavior is active; Favorites and Search remain visibly disabled because they are outside T01-T23 scope.
- Product-detail route correction waits for real category metadata and does not fabricate `kategori/kategori` URLs.
- Product card and detail now use real API semantics:
  - `rating` is rating
  - `sell_count` is sold count
  - `stock` is stock
- Local static product data remains for home-page showcase components only, not canonical Shop/Detail API state.
- T17-T19: Redux owns cart lines, quantity/selection mutations, bounded Header dropdown, cart table, and neutral shipping/discount totals.
- T20-T22: `/order` is protected, uses Redux address/card collections, React Hook Form CRUD views, transient CCV state, and one shared order payload/total calculation.
- T23: `/orders` is protected, loads authenticated order history, supports loading/failure/empty states and expandable product lines.
- Cart identity is `product.id`; variants and product details are not fabricated.
- CCV is never persisted in Redux, browser storage, logs, or saved cards.
- Live API invalid product-id behavior observed on 2026-07-21: `GET /products/99999999` returned HTTP 500. The UI handles this as a retryable detail failure and does not show fallback product data.

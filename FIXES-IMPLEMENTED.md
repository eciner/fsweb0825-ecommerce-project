# Re-Audit and Repair Ledger (T01-T16)

## Audit Date

2026-07-21

## Key Corrections Delivered

- Replaced unkeyed list request promise strategy with query-keyed dedupe map and request-id stale-response guards.
- Replaced local sorting/filtering subset behavior with real API query params (`category`, `sort`, `filter`, `limit`, `offset`).
- Added URL synchronization contract for Shop query state with refresh/back-forward resilience.
- Implemented numbered pagination with page normalization and offset math.
- Replaced legacy product detail behavior with API-backed detail fetch by product id.
- Removed false local fallback to first product on unknown product id.
- Removed premature T17 cart behavior from the T16 baseline; cart behavior is now active after the T17-T23 implementation.
- Normalized API errors into serializable shape `{ message, status, code }` before Redux storage.
- Preserved real user fields from login/verify responses while excluding token fields from Redux.
- Added reachable desktop/mobile logout controls that clear stored token, Axios auth state, and Redux user state.
- Strengthened signup validation for whitespace-only names, role load retry, Turkish mobile normalization, store tax normalization, and Turkish IBAN checksum.
- Prevented fabricated product-detail routes when category metadata has not loaded yet.
- Added route-level code splitting with `React.lazy`/`Suspense`, reducing the main build chunk below Vite's warning threshold.
- Corrected misleading visible controls/copy:
  - Contact CTA now opens email instead of routing to home.
  - About CTA placeholder label was replaced with `Contact Us`.
- Added focused automated tests for query, pagination, slug, product normalization, and reducer stale-response logic.
- Added focused automated tests for signup normalization and validation helpers.

## Files with Primary Architectural Changes

- `src/store/actions.js`
- `src/store/reducer.js`
- `src/services/api.js`
- `src/pages/ShopPage.jsx`
- `src/pages/ProductDetailPage.jsx`
- `src/layout/PageContent.jsx`
- `src/components/ProductCard.jsx`
- `src/utils/query.js`
- `src/utils/pagination.js`
- `src/utils/slug.js`
- `src/utils/productModel.js`

## Postman and Environment

- Updated `.env.example` to the correct API base URL.
- Expanded `postman/fsweb0825-ecommerce.postman_collection.json` through T16:
  - roles
  - signup/login/verify
  - categories
  - products base query
  - products category/filter/sort combinations
  - products pagination (`limit`, `offset`)
  - product detail (`/products/:productId`)

## Validation Snapshot

- `npm install` completed.
- `npm ci` completed after stopping a stale local Vite dev-server process that was locking a native dependency.
- `npm run lint` passes.
- `npm test -- --run` passes (7 files, 23 tests).
- `npm run build` passes with no chunk-size warning after route-level splitting.
- `npm audit fix` completed without `--force`.
- `npm audit` currently reports 2 moderate Vitest advisories; resolving them requires a breaking Vitest 5 upgrade, so `--force` was not used.

## Live API Verification Notes

- `GET /roles` returned admin/store/customer roles with semantic `code` values.
- `GET /categories` returned 14 category objects with `id`, `code`, `title`, `img`, `rating`, and `gender`.
- `GET /products?limit=2&offset=0` returned `{ products, total }`.
- `GET /products?category=2&filter=siyah&sort=price%3Adesc&limit=2&offset=0` returned filtered/sorted product results and active-query `total`.
- `GET /products/266` returned a real product detail object.
- `GET /products/99999999` returned backend `500`, not `404`; UI treats this as a retryable detail failure without displaying fallback product data.
- `POST /login` plus `GET /verify` succeeded with raw-token `Authorization` and token renewal; token values were not printed or stored in Redux.

## Figma

- Expected export was found at:
  - `src/figmas/figma-export/Ecommerce_UI_Kit_Full_Export`
- Functional implementation prioritized `project-phases.md`; visual work preserved without inventing unsupported product-detail data.

## T17-T23 Audit and Repair

- Added one Redux-owned cart model with product-id identity, repeat-add increments, checked selection, bounded Header dropdown, and explicit empty state.
- Added responsive `/cart` table and reusable Order Summary with derived products total, neutral shipping/discount, and grand total.
- Added protected React Router v5 `/order` flow with address and saved-card CRUD thunks, selected address/card state, transient CCV, duplicate-submit prevention, and success reset after API confirmation.
- Added protected `/orders` history with loading, failure/retry, empty, table, and expandable detail states.
- Added focused cart reducer and calculation tests.
- API requests use the existing Axios instance and normalized errors; no token, card number, or CCV values are added to Redux or documentation.

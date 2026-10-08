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

- Historical T01-T16 note: `.env.example` was updated to the API base URL used at that time. Phase 10A supersedes it with `http://localhost:8080` as the local default; Vercel Production must explicitly set `VITE_API_URL` to the Render API URL.
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
- The 2026-07-21 audit snapshot reported 2 moderate Vitest advisories; the later Phase 10A audit snapshot below supersedes that result.

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

## Phase 10A Final Hardening

- Upgraded Axios to `1.20.0`, removing the production dependency advisory without a major-version change.
- Restricted public signup to the `customer` and `store` roles in both the UI and backend; admin-role signup is rejected with a stable error and covered by an auth test.
- Corrected signup success copy to reflect immediate account availability; no activation email is sent.
- Set the local API fallback and `.env.example` to localhost. Production API selection is explicit through `VITE_API_URL`.
- Updated the Postman collection for local-only execution, current address/card/order contracts, canonical order-price checks, history verification, and temporary-record cleanup. Local Newman verification passed: 32 requests and 35 assertions, with no failures.
- Reconciled assignment and progress documentation against verified behavior. The T22/T23 collection checks are recorded as local verification, not Production E2E.
- Verification snapshot (2026-10-08; Node.js 22.19.0, npm 10.9.3, Java 21.0.12): frontend lint/build passed and tests passed (73 tests across 13 files); backend `clean verify` exited 0 with `BUILD SUCCESS`, 65 tests and zero failures/errors/skips, and the packaged JAR present; local Newman passed 32 requests and 35 assertions. Production dependency audit (`npm audit --omit=dev`) reported zero vulnerabilities.
- Full development-inclusive audit (`npm audit --json`) reported four affected package entries: one moderate, one high, and two critical. The entries are `@vitest/mocker@3.2.7` (GHSA-82fw-gwwq-j7x9; patched in 4.1.11), `source-map-js@1.2.1` (GHSA-68fv-2mgg-jv7q; patched in 1.2.2), `tinypool@1.1.1` (GHSA-5gmw-xhrv-c9v3; patched in 2.1.1, and GHSA-85c8-ppgw-ccpr; patched in 2.1.2), and `vitest@3.2.7`, which npm reports as an aggregate affected package for the Vitest/mocker/Tinypool chain. These are four package entries representing four underlying advisories; the aggregate is not a fifth advisory.
- Audit triage: npm reports a compatible transitive fix for `source-map-js` (`fixAvailable: true`); the lockfile was not changed in this phase. npm's suggested fix for the Vitest/mocker/Tinypool chain is `vitest@5.0.3`, a major upgrade. Registry metadata also shows Vitest 4.1.11 supports Vite 7 and includes `@vitest/mocker@4.1.11`; this major migration has not been installed or tested and is not claimed as remediation. Development dependencies run in frontend CI, so the remaining findings are not treated as harmless.

## Phase 10B Dependency Remediation

- The Phase 10A audit above is the **before** snapshot from 2026-10-08: 4 affected package entries (1 moderate, 1 high, 2 critical); `npm audit --omit=dev` reported 0 production findings.
- The verified **after** snapshot from 2026-10-09 uses Node.js 22.19.0 and npm 10.9.3: Vitest and `@vitest/mocker` resolve to 4.1.11, the vulnerable Tinypool dependency is absent, `source-map-js` resolves to 1.2.2, and Axios remains 1.20.0. Vite remains 7.3.6 and the Node engine range is unchanged.
- `npm ci` passed and left `package-lock.json` byte-identical. Frontend lint and build passed; all 73 tests passed across 13 files. `npm audit --omit=dev` and full `npm audit` each reported 0 vulnerabilities at this verification snapshot. This records the audit result on that date, not a guarantee about future dependency advisories.

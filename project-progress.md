# Project Progress

## Frontend Status Through WorkinTech T23 (Re-audited)

- Completed and verified locally: T01-T23
- Live authenticated address/card/order endpoint verification requires a valid test session token.
- Postman request coverage exists for all checkout/order endpoints; no test account data was created solely for this audit.

The frontend stabilization sequence ended with authenticated order-history navigation (`04c69a2`), checkout validation and state synchronization (`15ce012`), Node runtime pinning and frontend CI (`eb6f7e6`), and final frontend status reconciliation (`1d19502`). The React/Vite frontend remains independently deployable and retains its existing external API contract until internal backend Phase 9.

## Internal Backend Progress

WorkinTech T01-T23 labels above are assignment tasks; the backend Phase 1-10 labels below are the separate implementation roadmap. The backend source is `server/` on `feat/backend-api`.

| Phase | State | Verified commit | Result |
| --- | --- | --- | --- |
| 1 — Foundation | Complete | `e335d72` | Spring Boot, Maven Wrapper, Java 21, health endpoint |
| 2 — Persistence | Complete | `533b163` | PostgreSQL, JPA/Hibernate, Flyway migrations |
| 3 — Catalog | Complete | `4729cf9` | Roles, categories, products, frontend-compatible queries |
| 4 — Authentication | Complete | `9bd1e51` | JWT signup/login/verify, BCrypt, raw-token compatibility |
| 5 — User resources | Complete | `91f60a1` | Authenticated address/card APIs and ownership checks |
| 6 — Orders | Complete | `d4e9f63` | Transactional `POST /order`, owner-scoped `GET /order`, canonical pricing and stock updates |
| 7 — Integration coverage + CI | Next; not started | — | PostgreSQL/Testcontainers tests and separate backend CI planned |
| 8 — Deployment | Future | — | Docker, Render, PostgreSQL deployment planned |
| 9 — Frontend cutover | Future | — | Connect frontend to Spring API planned |
| 10 — Final hardening | Future | — | Final hardening and documentation planned |

Current approved backend baseline is `d4e9f63f61da4386fa222bc79625ba5ee2330e4b` (local and `origin/feat/backend-api` matched after fetch). Phase 5 closed with 46 passing tests and a passing package; Phase 6 closed with Java 21.0.12, 54 passing tests, zero failures/errors/skips, and a passing package. Phase 6 includes Flyway V7, database-authoritative `BigDecimal` totals, `PESSIMISTIC_WRITE` inventory locking in ascending product order, rollback on failed orders, and no CVV or full card number in order history. Saved cards still persist full `card_no` solely for temporary capstone compatibility.

Local Phase 7 environment preparation was separately verified with WSL 2, virtualization, Docker Desktop/client/daemon, `docker info`, and `hello-world`. This is preparation, not Phase 7 implementation. The audited Phase 7 plan retains the fast H2 suite, adds real PostgreSQL migration, time-zone and locking checks through Testcontainers, and adds Java 21 Maven Wrapper backend CI without production secrets. Witshop remains a read-only reference for assignment interpretation and architecture; this project's contracts and decisions remain authoritative.

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
- Card expiration is validated as a month/year pair against the current month.
- Address/card load and delete failures remain visible and do not silently mutate checkout state.
- Node.js 20.19+ is supported; Node 22 is pinned for CI in `.nvmrc` and `.github/workflows/frontend-ci.yml`.
- Live API invalid product-id behavior observed on 2026-07-21: `GET /products/99999999` returned HTTP 500. The UI handles this as a retryable detail failure and does not show fallback product data.

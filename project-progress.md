# Historical project progress

Retained on 2026-10-20 as a distinct record of earlier engineering/CI/deployment
checkpoints. The canonical current explanation is [PROJECT_DETAILS.md](PROJECT_DETAILS.md),
with [README.md](README.md) for setup. Dated headings and claims below describe
those checkpoints, not fresh Production identity or the latest local enhancement.
The current local schema is V13; E01-E07 and Stage 2 are local/unreleased. No earlier
count or deployment acceptance is relabeled as current. The original source records
remain useful for exact historical SHAs and intentional frontend/backend identities.

---

# Current enhancement note - 2026-10-17

Local enhancement/remediation status supersedes current-state claims in the dated
Phase-10 snapshots below. Search and account-persistent favorites work; Home is
API-backed. V8-V11 add the catalog, owned snapshots/favorites and persisted contact.
V12 provides optional customer-scoped order request IDs; legacy clients still work.
Card summaries/mutation reconciliation are masked before client state, but legacy
PAN storage/responses continue to block commercial payment readiness. CCV is transient.

Confirmed writes are separate from refresh failures; unknown resource writes require
reconciliation. Order success invalidates list/detail caches; Shop totals and rows
share committed query identity. The seven-person team is a newer enhancement
choice, separate from the preserved original T06 Project Manager requirement.

Demo accounts are isolated local provisioned records, not public production accounts.
Current test and actual browser evidence are in the appended independent remediation
section of [PROJECT_DETAILS.md](PROJECT_DETAILS.md). No historical test
or release is being relabeled as having contained these enhancements. Release ordering
and backup/rollback gates are in [the release gates](PROJECT_DETAILS.md#deployment-evolution-and-release-gates).
Commercial-production readiness BLOCKED; no push/deploy/production mutation performed.

---

# Project Progress

## Current Application Release and Delivery Status

The approved application release is `173a5786ca41dbef2c9ce0f557900a27d0464323`. The 2026-10-16 Production deployment records identify that SHA on Vercel `main` and Render `feat/backend-api`:

| Evidence | Verified record |
| --- | --- |
| Vercel Production | `dpl_3G5vPZdmVSRk3SEPaicLtA1Act7G` — READY; [frontend](https://fsweb0825-ecommerce-project.vercel.app) |
| Render Production | `dep-db94gt3bc2fs73blvb10` — live; [API](https://fsweb0825-ecommerce-api.onrender.com) |
| Main Frontend CI | [38943655647](https://github.com/eciner/fsweb0825-ecommerce-project/actions/runs/38943655647) — completed/success; 73 tests / 13 files; lint/build PASS |
| Main Backend CI | [38943655457](https://github.com/eciner/fsweb0825-ecommerce-project/actions/runs/38943655457) — completed/success; 65 tests; zero failures/errors/skips; package PASS |

| Delivery layer | Status |
| --- | --- |
| Phase 10 application implementation | Complete in the approved application release; latest backend application change `e2b2a67b21973e196b1e90993bb213c3a2a53848` restricts public signup roles |
| Phase 10 Production release | Verified through Phase 10K; read-only public browser/API acceptance completed 2026-10-17 Europe/Istanbul |
| Documentation close-out | Phase 10L found material documentation/setup defects; Phase 10M supplies local corrections pending user review, commit and delivery verification |
| Academic submission readiness | Final delivery close-out remains pending documentation verification/delivery and checking the actual assignment's requirements; no institutional acceptance is claimed |

Phase 10K covered public catalog/detail/category navigation, login/signup rendering, cart, protected-route redirects, direct refresh and responsive layouts. It did not repeat authenticated checkout on the final Production SHA. Exact-SHA CI runs against isolated test databases; Phase 10M does not rerun CI or Production E2E. The [README](README.md) records local setup, database lifetime, cold starts and payment/security limitations.

## Historical Frontend Status Through WorkinTech T23

- The T01-T23 implementation record is preserved in [project-phases.md](project-phases.md), with explicit approved differences from original signup/address wording. T22/T23 authenticated requests were executed through Newman against an isolated local Spring/PostgreSQL backend.
- Historical Phase-9 authenticated Production E2E completed for the existing synthetic customer, including exactly one authorized persistent test order (ID 3); do not repeat that order.
- Phase-9 frontend release: `53b10d82d6b921dea3b919a81f3895a875f860ca` on `main`.
- Historical Frontend CI `37214593709` for that exact main SHA completed successfully; 69 tests across 13 files, lint/test/build PASS.
- Historical Vercel deployment `dpl_A8W4i4gonFdW2buxLMXo4AujkoEc` was READY for that Phase-9 release and targeted Render.

The Phase-9 release followed authenticated order-history navigation (`04c69a2`), checkout validation/state synchronization (`15ce012`), Node runtime pinning/frontend CI (`eb6f7e6`), final frontend status reconciliation (`1d19502`) and pre-Phase-9 stabilization (`ae4322a`). The frontend remains independently deployable. At that historical checkpoint Render's source branch was `feat/backend-api` at `ae4322a47a807c64d16c3126276ca607003a19fc`, while the Phase-8 backend implementation baseline remained `da060ef841a3421cfd2a0ebcb6c0d94446c253d6`.

## Internal Backend Progress

WorkinTech T01-T23 labels above are assignment tasks; the backend Phase 1-10 labels below are the separate implementation roadmap. The backend source is `server/` on `feat/backend-api`.

| Phase                         | State       | Verified commit | Result                                                                                      |
| ----------------------------- | ----------- | --------------- | ------------------------------------------------------------------------------------------- |
| 1 — Foundation                | Complete    | `e335d72`       | Spring Boot, Maven Wrapper, Java 21, health endpoint                                        |
| 2 — Persistence               | Complete    | `533b163`       | PostgreSQL, JPA/Hibernate, Flyway migrations                                                |
| 3 — Catalog                   | Complete    | `4729cf9`       | Roles, categories, products, frontend-compatible queries                                    |
| 4 — Authentication            | Complete    | `9bd1e51`       | JWT signup/login/verify, BCrypt, raw-token compatibility                                    |
| 5 — User resources            | Complete    | `91f60a1`       | Authenticated address/card APIs and ownership checks                                        |
| 6 — Orders                    | Complete    | `d4e9f63`       | Transactional `POST /order`, owner-scoped `GET /order`, canonical pricing and stock updates |
| 7 — Integration coverage + CI | Complete    | `3b02fff`       | PostgreSQL/Testcontainers and Backend CI                                                    |
| 8 — Deployment                | Complete    | `da060ef`       | Docker, Render, PostgreSQL, production CORS                                                 |
| 9 — Frontend cutover          | Complete    | `53b10d8`       | Production Render API integration, cart/checkout repairs, public and authenticated E2E      |
| 10 — Final hardening          | Implementation/release verified; docs pending | `173a578` | Phase 10K accepted; Phase 10M documentation patch awaits review and commit/delivery verification |

The current approved application release and exact-SHA Production/CI evidence are recorded above. Phase-8 and Phase-9 baselines recorded here are historical milestones. Phase 5 closed with 46 passing tests and a passing package; Phase 6 closed with Java 21.0.12, 54 passing tests, zero failures/errors/skips, and a passing package. Phase 6 includes Flyway V7, database-authoritative `BigDecimal` totals, `PESSIMISTIC_WRITE` inventory locking in ascending product order, rollback on failed orders, and no CVV or full card number in order history. Saved cards may retain full `card_no` solely for temporary capstone compatibility; no at-rest masking or PCI-compliance claim is made.

Historical Phase-7 environment preparation was separately verified with WSL 2, virtualization, Docker Desktop/client/daemon, `docker info` and `hello-world`; that preparation was distinct from the subsequent implementation. Completed Phase 7 retained the fast H2 suite, added real PostgreSQL migration/time-zone/locking checks through Testcontainers, and introduced Java 21 Maven Wrapper backend CI without production secrets. Witshop remains a read-only reference for assignment interpretation and architecture; this project's contracts and decisions remain authoritative.

## Verified Highlights

- T08-T11: Signup/Login/Remember Me/Verify lifecycle implemented with Redux thunks and token lifecycle (`Authorization: token`, no `Bearer`).
- Signup validation rejects whitespace-only names, normalizes Turkish store phone/tax/IBAN fields, validates Turkish IBAN checksum, and exposes role-load retry. Public signup is Customer/Store only; the backend rejects Admin registration. Accounts are immediately usable, with no activation email.
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

## Canonical Product State (historical T16 shape; enhancement fields described above)

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

- T17 cart behavior is active; Favorites and Search were outside the T01-T23 baseline; both are implemented by the later local enhancement.
- Product-detail route correction waits for real category metadata and does not fabricate `kategori/kategori` URLs.
- Product card and detail now use real API semantics:
  - `rating` is rating
  - `sell_count` is sold count
  - `stock` is stock
- Home, Shop and Detail now read API data; the unused legacy showcase data/component were removed by the dated remediation.
- T17-T19: Redux owns cart lines, quantity/selection mutations, bounded Header dropdown, cart table, and neutral shipping/discount totals.
- T20-T22: `/order` is protected, uses Redux address/card collections, React Hook Form CRUD views, transient CCV state, and one shared order payload/total calculation. Newman verified these APIs against local Spring/PostgreSQL; the separate authenticated Production E2E was historical Phase 9.
- T23: `/orders` is protected, loads authenticated order history, supports loading/failure/empty states and expandable product lines. Local Newman and the historical Phase-9 Production order-history E2E passed; fresh authenticated history was not re-exercised on the final Phase-10 Production SHA.
- Cart identity is `product.id`; variants and product details are not fabricated.
- CCV is never persisted in Redux, browser storage, logs, or saved cards. Legacy saved-card API responses can contain full `card_no`; the current client uses masked summary reads and masks mutation responses before Redux. This capstone is not PCI compliant.
- Card expiration is validated as a month/year pair against the current month.
- Address/card load and delete failures remain visible and do not silently mutate checkout state.
- Node.js 20.19+ is supported; Node 22 is pinned for CI in `.nvmrc` and `.github/workflows/frontend-ci.yml`.
- The original WorkinTech API returned HTTP 500 for an invalid product ID in a 2026-07-21 observation. The Spring API returns 404; the deployed frontend renders the expected not-found state.

# Fixes implemented

Current technical record: 2026-10-20. Latest changes are local, unreleased.
The dated historical records below remain evidence of those snapshots. Their older
state descriptions (including full card records in Redux) are superseded by the
current summary and [PROJECT_DETAILS.md](PROJECT_DETAILS.md). [README.md](README.md)
is the current setup guide; [PROJECT_EXTRAS.md](PROJECT_EXTRAS.md) compares scope.

## Current fixes and regression evidence

The table records symptoms, root cause, effect, solution, source evidence,
verification/regression and residual limits. Commit references below identify
published history; later local development is linked to source and tests available
in the clean publication candidate.

| Issue/component | Symptoms, root cause and impact | Implemented correction/source evidence | Verification/regression | Remaining limit |
| --- | --- | --- | --- | --- |
| Catalog query races | Unkeyed promises or unguarded responses could mix old rows/totals with a new query | Query-keyed deduplication and request/committed-query guards in actions/reducer/ShopPage; historical T01-T16 repairs, [actions](src/store/actions.js) and [reducer](src/store/reducer.js) | actions/reducer/query tests and real search navigation | Remote failures still require visible retry |
| False detail fallback | Missing id could display the first local item, misrepresenting identity | API-backed id fetch, explicit 404/error/loading and metadata-aware route helpers | productModel/productDetailRoute/slug tests and browser direct navigation | Unsupported attributes remain absent |
| Routing/layout/overflow | History menu and mobile cart readiness were inconsistent | Shared routes/navigation and validity-gated checkout, bounded responsive cart; `04c69a2`, `15ce012`, `53b10d8` | DOM flows and mobile browser checks | Tested widths are not every-device certification |
| Session/account callbacks | Late A callbacks could clear B's checkout or restore stale state | Session revision, account/request/attempt settlement guards; [checkout state](src/store/checkoutState.js) and [checkout safety tests](src/tests/checkoutSafety.dom.test.jsx) | checkoutSafety/reducer/DOM cases including account switch | Browser profile itself is not an encrypted security boundary |
| Public signup semantics | Admin was selectable and success copy implied unsent activation mail | Customer/Store allowlist in UI/server; truthful immediate activation; `e2b2a67` and Phase-10 records | Auth/signup tests | No email verification or auth throttling |
| Local Spring API/configuration | Old external default and missing production target could silently select localhost | Local fallback retained; explicit production-build HTTP(S) target required via config/apiTarget.js and Vite callback | buildConfig tests, clean positive/negative build checks | Deployment must still supply the intended HTTPS URL |
| Resource mutation reconciliation | Successful mutation followed by failed refresh appeared failed and invited duplicates | Confirmed writes retain success; ambiguous writes block repetition and offer GET reconciliation; [resource mutations](src/store/ownedResources.js) and [regression tests](src/store/remediation.test.js) | remediation/journeys DOM tests | Unknown results may require manual reconciliation |
| Canonical transaction/inventory | Client totals and concurrent last-unit requests could otherwise undermine purchase integrity | Owner validation, canonical prices, ordered product locks, stock/sell_count bounds and atomic order/line/shipment writes; OrderService, `d4e9f63`, later extensions | PostgreSQL last-unit, failed-line rollback and price tests inspect stored values | No real payment, shipping or tax engine |
| Order replay/recovery | Lost committed response could be retried as a new purchase; later 401 wrongly cleared uncertainty | Nullable [V12](server/src/main/resources/db/migration/V12__order_request_identity.sql) owner-scoped key/fingerprint and immutable account-bound intent retained through errors/reload; [pending intent](src/store/pendingOrder.js) and [PostgreSQL tests](server/src/test/java/com/eciner/ecommerce/order/PostgresOrderIntegrationTests.java) | PostgreSQL identical/different UUID races, lost-response browser cases | Legacy unkeyed calls and lost storage lack the same protection |
| Historical snapshots/cart consumption | Later product/address edits or new cart lines could distort confirmed history/consumption | V9 purchase snapshots, stored confirmation, original opaque-line reservations and selective quantity consumption | order/checkout/cart-session/browser regressions | Missing old snapshots cannot be reconstructed |
| Guest merge/revalidation | Memory-only carts vanished on refresh and stale-tab merges could duplicate guest lines | Bounded account-separated IDs, merge claims and canonical hydration; [cart persistence](src/store/cartSession.js) and [cart actions](src/store/cartActions.js) | cartSession/reducer/DOM and browser refresh/login cases | Same-browser only; no live multi-tab sync |
| Search/Turkish folding | Collection-scoped global search or asymmetric text folding missed expected results | Unrestricted global Header query, symmetric Turkish normalization, escaped LIKE punctuation and whole-set SQL filters; [query normalization](src/utils/query.js) and [SQL predicates](server/src/main/java/com/eciner/ecommerce/product/ProductQueryRepositoryImpl.java) | query/product/PostgreSQL and real mouse/keyboard/touch cases | No invented brand/size taxonomy |
| Store ownership | Legacy scalar store ids could collide with newly registered Store ids | Explicit verified foreign key and Admin audit; snapshot on purchase; [V13](server/src/main/resources/db/migration/V13__store_scoped_fulfillment.sql) and [ownership service](server/src/main/java/com/eciner/ecommerce/fulfillment/FulfillmentOwnershipService.java) | Collision, reassignment and foreign Store H2/PostgreSQL tests | Unknown/historical ownership remains Admin-managed |
| Shipment concurrency/audit | Concurrent editors/retries could lose changes or duplicate events | Scoped row locks, expected versions, UUID replay, immutable events and consistent read snapshot; ShipmentService/repository | H2/PostgreSQL concurrent winner/duplicate/read-snapshot tests, restart/browser cases | Demo lifecycle, no live carrier |
| AUD-023 customer actor exposure | Shared management DTO leaked internal numeric account ids in customer JSON; hiding text alone would leave exposure | ShipmentView.forCustomer removes actor ids before serialization; NON_NULL omits the field. Management projection/database events remain. UI retains status/kind/time without inventing a migration actor | Shared customerHistoryOmitsActorIdsWhileScopedManagementRetainsAudit runs on H2/PostgreSQL; DOM and actual browser JSON checks; foreign user/Store denial | Customer timeline deliberately gives no unverified historical role |
| E2E isolation/portability | Inherited config/JVM/datasources could migrate a wrong database; hard-coded username path blocked reuse | Fixture-issued container capability, explicit classpath/Flyway/data source, minimal Java env, label/binding cleanup guards; [stack fixture](e2e/local-stack.js) and [isolation canaries](e2e/isolation.test.js); current-user Docker discovery in Stage 2 | Four canaries, real restart and browser suites | Windows Docker Desktop named pipes and Edge required |
| Malformed information hash | decodeURIComponent could throw on malformed fragments | Guard invalid decoding, preserve valid focus/scroll; [InformationPage](src/pages/InformationPage.jsx) and [navigation tests](src/tests/informationNavigation.dom.test.jsx) | informationNavigation DOM test | No broad router rewrite |
| AUD-001/007 publication privacy | Deleting private files at HEAD would still publish earlier local blobs; public docs linked excluded plans | Clean-base candidate deltas, explicit inventories/outgoing scans, canonical public links; original local history retained | Complete outgoing commit/tree/content checks and clean checkout | Original enhancement/audit/custom refs must never be pushed wholesale |
| AUD-006/WP3 documentation | README migration/routes/test/release statements conflicted | Four canonical English documents, original-task annotations and historical progress positioning | Relative-link/path/commit/claim checks plus fresh setup verification | Historical observations are dated, not current Production PASS |
| WP6/WP7 CI/cleanup | Implicit workflow token policy; obsolete unconsumed configuration/starter art | Explicit contents:read for checkout/build-only workflows; removed tailwind.config.js and unreferenced React starter SVG | Reference/dynamic/config review, lint/tests/build and browser regressions | history is used by tests; favicon and uncertain archival images retained |

## Stage 2 decisions and limitations

T06 retains the seven supplied contributors, T08 immediately activates accounts,
and T22 sends no PAN/CVV. These approved differences remain explicit. Legacy saved
card storage/response PAN remains a commercial-security blocker. No V14, payment
provider, mail service, carrier, proxy-trust or authentication redesign was introduced.
Historical image/Figma rights are UNKNOWN / REQUIRES USER REVIEW; Montserrat's OFL
notice remains. No root project license was invented.

Initial fresh Stage 2 evidence: frontend lint/build PASS, 183 tests in 27 files;
Java 21 isolated clean verify PASS, 112 tests including 23 PostgreSQL, zero failures/
errors/skips and packaged JAR. A running original local JAR blocked clean in the
primary checkout; an exact-source temporary build preserved that process and data.
The clean candidate worktree also passed all 183 frontend tests, 112 backend tests,
four isolation canaries, one restart test and 27 Edge browser cases (130 route/width
combinations). Details and warnings are in PROJECT_DETAILS.
No historical test is promoted to current evidence and no Production write occurred.

## Historical records

The following dated notes retain reliable original detail. Statements about actions
not performed apply to the dated patch described, not every later engineering session.

## Retained historical repair ledger (T01-T16)

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

## Historical Validation Snapshot — 2026-07-21

- `npm install` completed.
- `npm ci` completed after stopping a stale local Vite dev-server process that was locking a native dependency.
- `npm run lint` passes.
- `npm test -- --run` passes (7 files, 23 tests).
- `npm run build` passes with no chunk-size warning after route-level splitting.
- `npm audit fix` completed without `--force`.
- The 2026-07-21 audit snapshot reported 2 moderate Vitest advisories; the later Phase 10A audit snapshot below supersedes that result.

## Historical WorkinTech API Verification — 2026-07-21

- `GET /roles` returned admin/store/customer roles with semantic `code` values.
- `GET /categories` returned 14 category objects with `id`, `code`, `title`, `img`, `rating`, and `gender`.
- `GET /products?limit=2&offset=0` returned `{ products, total }`.
- `GET /products?category=2&filter=siyah&sort=price%3Adesc&limit=2&offset=0` returned filtered/sorted product results and active-query `total`.
- `GET /products/266` returned a real product detail object.
- `GET /products/99999999` returned backend `500`, not `404`; UI treats this as a retryable detail failure without displaying fallback product data.
- `POST /login` plus `GET /verify` succeeded with raw-token `Authorization` and token renewal; token values were not printed or stored in Redux.

## Figma

- Historical visual review used a local Figma export. It is not a required public build input and redistribution rights are not established here.
- Functional implementation prioritized `project-phases.md`; visual work preserved without inventing unsupported product-detail data.

## Historical T17-T23 Audit and Repair

- Added one Redux-owned cart model with product-id identity, repeat-add increments, checked selection, bounded Header dropdown, and explicit empty state.
- Added responsive `/cart` table and reusable Order Summary with derived products total, neutral shipping/discount, and grand total.
- Added protected React Router v5 `/order` flow with address and saved-card CRUD thunks, selected address/card state, transient CCV, duplicate-submit prevention, and success reset after API confirmation.
- Added protected `/orders` history with loading, failure/retry, empty, table, and expandable detail states.
- Added focused cart reducer and calculation tests.
- API requests use the existing Axios instance and normalized errors. Authentication tokens are excluded from Redux user objects, and CVV/CCV remains transient rather than being persisted in Redux or saved cards.
- Saved-card API responses may contain full `card_no`: `fetchCreditCards` dispatches `setCreditCards`, and the reducer stores these records in `client.creditCards`. The backend retains/returns full PAN for temporary capstone compatibility. Development Redux logging redacts sensitive fields and the Production logger is disabled. This is not PCI-compliant production payment handling; no PAN masking or encryption-at-rest claim is made.

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

## Phase 10M Documentation Remediation (Local)

- Phase 10 application implementation and Production release were verified through Phase 10K at `173a5786ca41dbef2c9ce0f557900a27d0464323`; historical Phase-9 authenticated E2E remains separate from final-release read-only acceptance.
- Phase 10L identified stale release/status statements, missing local CORS guidance, unqualified assignment differences and the incorrect Redux/card-state assurance corrected above. Phase 10M supplies documentation-only corrections in the four authorized Markdown files, pending user review and commit/delivery verification. Final academic delivery close-out is not declared complete.
- The dated July, Phase-10A before and Phase-10B after verification results remain historical snapshots. No dependency audit, CI rerun, Production E2E, push or deployment is performed for this documentation patch. See [README.md](README.md) for the approved release evidence, reproducible setup and demo/security limitations.

## Independent audit remediation - 2026-10-17 (local, unreleased)

The earlier entries retain their historical dates and results. Later P00-P12
changes replaced the mailto CTA with persisted contact, enabled search/favorites,
and replaced static Home products with API data. Saved-card summary reads and
mutation reconciliation mask PAN before Redux; legacy full-PAN storage/responses
remain compatible and continue to BLOCK commercial-production readiness.

The new remediation separates confirmed resource writes from failed GET refreshes,
blocks uncertain write repetition, invalidates inventory caches after confirmed
orders, binds Shop totals to committed queries, and adds customer-scoped optional
UUID order replay protection through additive V12. Purchase-time snapshots and
selective cart consumption remain. Durable DOM and isolated full-stack browser
suites replace one-off diagnostics as repeatable acceptance evidence.

Exact root causes, files, observed counts, known limitations and local commits are
recorded in [PROJECT_DETAILS.md](PROJECT_DETAILS.md).
Release strategy is [the release gates](PROJECT_DETAILS.md#deployment-evolution-and-release-gates).
No previous release/test is claimed to include these corrections. No remote delivery
or production write is performed; no PCI, legal-compliance or commercial-readiness
claim is made.

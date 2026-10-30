# Engineering beyond the original capstone

Reconciled for the 30 October 2026 Production cutoff. [T01-T23](project-phases.md)
expected a React storefront using the external WorkinTech API. Catalog/auth/cart/
address/card/order UI is original
scope. Independently implementing the server is additional engineering, while
preserving a required UI is not automatically a new product feature. The
capabilities below are present in the selected Production source releases, except
where explicitly described as local test tooling or a limitation. See
[PROJECT_DETAILS.md](PROJECT_DETAILS.md) for task traceability/results, [README.md](README.md) for setup and
[FIXES-IMPLEMENTED.md](FIXES-IMPLEMENTED.md) for repairs.

Production uses frontend `main` at `87ca72100902c04ef32862ce458c5d62d4831fb8`
and backend `feat/backend-api` at `71ea32c90c1438882abb3c457bfc7a659c8493b3`.
Vercel is READY and Render is LIVE, with PostgreSQL 16/Flyway V1-V13. Exact-release
CI [39695105189](https://github.com/eciner/fsweb0825-ecommerce-project/actions/runs/39695105189)
records 183 frontend tests plus lint/build PASS; backend CI
[39855500412](https://github.com/eciner/fsweb0825-ecommerce-project/actions/runs/39855500412)
records 114 tests/package PASS. The [release evidence](PROJECT_DETAILS.md#verification-and-ci)
separates historical acceptance from current metadata.

**Excluded from deployed extras:** QA branch `release/d8-frontend-qa` at
`83e2473338047c1868f2cd339a3b1b29d6df69ad`, its 199-test pass/Zod fix, and the
local hero slider autoplay patch with 204 passing tests. They are not Production.
No latest authenticated browser E2E pass is inferred from the capabilities below.

## Alternative implementation and infrastructure

**Custom Spring Boot API: alternative plus additional engineering.** The original
API supplied the server. The `server` module independently implements consumed
contracts with typed controllers, validation, services, errors and JPA/JdbcTemplate
repositories. This makes business rules inspectable without rewriting consumers.
Controller tests verify requests, ownership and security. It is not full equivalence
with every unused endpoint of the external API; it adds operational responsibilities.

**PostgreSQL/Flyway: infrastructure enhancement.** V1-V13 establish catalog, users,
owned resources, orders, snapshots, favorites, contact and fulfillment. Additive
schema evolution preserves old records; Hibernate validates instead of creating
Production tables. Testcontainers covers fresh V13, V7→V13 and V12→V13 synthetic
upgrades, transactions and locks. Tests do not independently prove Production
backup/restore or a fresh migration run.

**Security/JWT: independent implementation of T08-T11.** `auth` adds password
hashing, signed expiring tokens, raw-header compatibility, Bearer support and exact
CORS. The principal supplies ownership; management reloads database role/Store.
Public Admin signup is rejected. Auth/CORS and two-user resource tests cover this.
Immediate activation has no email-ownership proof; auth throttling is future work.

**CI/deployment: engineering enhancement.** Workflows validate frontend lint/tests/
build and Java 21/PostgreSQL/package with read-only token permissions. The frontend
build requires explicit API configuration. Vercel and Render follow separate
branches with PostgreSQL/Flyway. Exact-release remote CI and the accepted
Vercel/Render identities are recorded above. Historical candidate checks remain
dated local evidence. CI and live metadata
do not prove a new authenticated browser purchase, backup/restore or commercial readiness.

## Stronger shopping and orders

**Canonical transactional checkout: substantial T22 extension.** `OrderService`
recalculates BigDecimal totals, aggregates quantities, locks products in id order,
prevents negative stock/sell_count overflow and commits order/items/inventory/
shipments atomically. Client price is nonauthoritative. Real PostgreSQL last-unit
race and failed multi-line tests inspect stored effects. This records demo orders,
without capture, freight/tax settlement or a payment provider.

**Replay/uncertain recovery: new engineering capability.** V12 adds nullable
owner-scoped UUID/fingerprint identity. Matching replays retrieve committed orders;
changed intent conflicts. Checkout state binds immutable payload to account/session/
attempt and retains uncertainty through transport/auth errors and reload. Tests in
checkoutSafety, pendingOrder, remediation and PostgreSQL verify competing payloads,
lost responses, account changes and rollback. Unkeyed calls lack deduplication;
lost browser storage limits recovery.

**Purchase snapshots/details: substantial T23 extension.** V9 stores product
name/image, canonical unit price, shipping/receipt and currency. `OrderDetails`
uses these instead of reinterpreting a purchase through later edits. Snapshot/
controller/browser tests verify persistence. Missing old data is disclosed, not
reconstructed. No card/CVV is part of order history.

**Persistent guest/account cart: T17-T18 extension.** `cartSession`/`cartActions`
persist bounded IDs/quantities/selections/opaque line ids, hydrate canonical products,
merge guest lines once and separate accounts. Reducer/session/DOM/browser tests
cover refresh, blocked storage, stock changes, duplicate clicks and recovery
consumption. Storage is same-browser, unencrypted, without cross-device cart or
live multi-tab synchronization.

**Persistent favorites: new capability.** V10 uniquely relates user/product;
owner-scoped APIs feed `FavoriteButton`/`FavoritesPage`. Favorite/controller/session
tests verify duplicate prevention and isolation. Guests are asked to authenticate
instead of being shown a false remote-persistence claim.

**Global search/filtering: T14 extension.** Header search escapes inherited
collection restrictions. `query.js` and SQL normalize whitespace/Turkish text and
escape LIKE punctuation. Price/stock combine with category/collection/text before
paging; mobile dialogs and committed chips preserve URL state. Query, PostgreSQL
and navigation tests cover ties/combinations/refresh. Flat categories remain flat;
unsupported brands/colors/variants are not invented.

**Province/receipt controls: T20 extension.** `CityCombobox` offers 81 Turkish
provinces, searchable keyboard selection and pinned major cities. Dependent city
changes clear suggestions while preserving street/building/apartment/postal detail.
Manual/non-Turkish input stays compatible. Address/keyboard/DOM/browser tests verify
saved/edit states. District/neighborhood suggestions are partial, not official
nationwide data. The combined `neighborhood` API field remains unchanged.

**Masked card summaries: T21 security refinement.** Summary DTOs and mutation
masking keep full PAN out of current Redux state; unchanged-PAN edits need not
reenter the number. Resource/card tests cover masking, expiry and reconciliation.
Legacy full-PAN storage/responses remain a commercial blocker. This is not
tokenization, PCI compliance or payment capture.

## Ownership and shipments

**Verified fulfillment ownership: new capability.** V13 distinguishes verified
Store foreign keys from legacy scalar `product.store_id`. Admin-only assignments
audit previous/new Store and actor/time; purchased lines snapshot ownership under
product locks. Controller/PostgreSQL tests verify id collisions, foreign Store
denial and non-retroactive assignment. Registration never claims old inventory.

**Multi-store shipments: new capability.** `ShipmentService` groups purchased
lines by snapshotted Store and keeps unknown ownership Admin-managed. Stores see
only their group; customers see only their own order. Locked/versioned lifecycle
updates and UUID replay append immutable events. PostgreSQL races, real three-role
browser flows and an actual API restart verify state. Historical imports are not
invented dispatch dates; there is no live carrier or delivery guarantee.

**Customer-safe history: security refinement.** Stage 2 removes actor ids from
customer JSON before serialization while preserving status/kind/time. Authorized
Store/Admin audit and immutable database associations remain. H2/PostgreSQL tests
verify both views and foreign access; the browser verifies effective JSON. The UI
does not relabel redacted events as migrations or infer historical actor roles.

## Content and quality

**Contact persistence: T05 extension.** V11/ContactService persist bounded consented
requests with UUID, honeypot validation and process-local throttle. Matching retry
acknowledges, changed content conflicts. Controller/browser tests cover this.
Persistence is not email delivery, a support SLA or distributed/proxy-aware protection.

**Journal/information pages: new content.** `blogPosts.js` contains three demo
articles with derived reading times. `informationPages.js` provides real footer,
FAQ/developer/legal routes. Content/navigation/hash tests cover links and failures.
These are demo texts, not legal advice, hiring offers or invented customer outcomes.

**Shared controls/theme: engineering extension.** Local fonts, focus-visible,
reduced motion, city/filter/shipment controls and responsive navigation reuse the
accepted design. Five-width routes and keyboard/browser checks support observed
behavior, not full accessibility conformance. Grid/custom CSS are disclosed as
literal styling differences; theme-wide token rewriting is outside scope.

**Database/browser isolation: engineering enhancement.** The `e2e` fixture issues
container capabilities, verifies ownership/local bindings and launches minimal
Java configuration with explicit datasource/Flyway arguments. Four canaries test
hostile inheritance/fabricated databases; restart verification proves persistence.
Testcontainers uses PostgreSQL 16 separately. Docker discovery is per current user;
Java 21/Edge/local Windows named pipes remain requirements. Remote Docker and generic
cross-platform browser support are not claimed.

**Publication/reproducibility: engineering enhancement.** Clean ancestry excludes
private plans/prompts from outgoing commits. Lockfiles, tracked source, Maven Wrapper
and documented environment variables allow standard startup without private helpers.
Outgoing scans, clean install/build/tests and document checks are separate gates;
a green build alone proves neither privacy nor redistribution rights.

## Boundaries

T06 seven-person Team, T08 immediate activation and T22 no-PAN/CVV decisions remain.
Legacy saved-card endpoints store/return full PAN for capstone compatibility;
use synthetic data only and no real card data. There is no real payment gateway
and the project is not PCI compliant. No V14, payment provider, carrier or mail
system is included. Database expiration is listed as 20 November 2026 at cutoff;
Free-service availability and backup readiness are separate operational concerns.
Historical image/Figma-derived rights remain **UNKNOWN / REQUIRES USER REVIEW**. Montserrat OFL is retained; no root project license or commercial-readiness
claim is implied. Licensing, academic acceptance and Production release are separate
owner decisions.

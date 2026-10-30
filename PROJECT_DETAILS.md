# FSWEB0825: project details

Engineering and requirement record reconciled for **30 October 2026 (Europe/Istanbul)**.
The selected academic submission is the existing Production frontend on `main` at
`87ca72100902c04ef32862ce458c5d62d4831fb8` and backend on `feat/backend-api` at
`71ea32c90c1438882abb3c457bfc7a659c8493b3`. Dated local candidate checks remain
historical evidence; QA work and the local slider patch are excluded from Production.
[README.md](README.md) provides setup, [FIXES-IMPLEMENTED.md](FIXES-IMPLEMENTED.md)
records repairs and [PROJECT_EXTRAS.md](PROJECT_EXTRAS.md) compares additions.

## Context and implementation philosophy

The WorkinTech frontend capstone asked for a responsive shopping application
consuming the external WorkinTech API. Its purpose was to connect routing,
asynchronous state, forms and HTTP contracts into a complete customer journey.
The later custom Spring backend made persistence, ownership, price authority,
transactions and operations independently inspectable while preserving the consumer.

[project-phases.md](project-phases.md) retains original T01-T23 wording/examples.
Original checkboxes are historical records, not automatic current compliance.
The original [Project board](https://github.com/users/eciner/projects/1) was read
through authenticated CLI on 2026-10-20: 23 matching task titles, all administratively
Done, with unchecked original subtasks still in some bodies. All 23 task records
were read again for this reconciliation on 2026-10-30. Repository wording,
formatting and historical checkbox states are preserved; board status alone is
not evidence of literal implementation or grading acceptance. Its T06 manager,
T08 activation and T22 payment wording differ from the approved current application.
Neither board status nor implementation annotations erase these differences.

The original **Full-Stack Backend & Deployment Roadmap, Version 2**, and its
**Version 2 Codex Markdown transcription** were read together. Roadmap section 2
orders authority as WorkinTech requirements -> current frontend/tests/Postman/working
behavior -> established architecture/decisions -> Witshop read-only reference -> general
best practices. The roadmap is an implementation plan, **not the grading rubric**.
Sections 5 and 9 select Java 21 / Boot 3.4.x; the deployed patch is 3.4.13, with no
Boot 4 migration. Sections 6 and 10-12 separate implementation/review from explicit
staging/commit and user-controlled push. Sections 16-17 require owner isolation,
no CVV persistence, canonical order totals and transactional inventory. Sections
19-23 describe deployment and acceptance goals; a goal is not proof of a fresh pass.
Original planning-baseline statements in Roadmap V2 remain historical.

| Roadmap implementation layer | Assignment / current evidence | Cutoff interpretation |
| --- | --- | --- |
| Phases 1-3: foundation, persistence, catalog | T01, T12-T16; `server`, catalog APIs and Flyway | Custom backend is additional engineering replacing the external API |
| Phase 4: JWT | T08-T11; signup/login/verify and existing frontend contracts | Customer/Store signup, immediate activation; email requirement remains a disclosed deviation |
| Phase 5: owned resources | T20-T21; address/card controllers and two-user tests | Combined address field preserved; legacy full-PAN API is demo-only and not PCI compliant |
| Phase 6: transactional orders | T22-T23; OrderService and PostgreSQL tests | Canonical pricing/locks/rollback; no PAN/CVV order payload or payment gateway |
| Phases 7-8: CI and hosting | Exact backend CI, Render deployment, PostgreSQL 16 | Runtime identity and isolated test evidence are distinct |
| Phases 9-10: cutover, hardening, documentation | Exact frontend CI/Vercel identity; historical acceptance | Production selected as-is; no latest authenticated E2E or institutional acceptance inferred |

Router 5 and ordinary Redux/Thunk preserve assignment contracts. Feature-oriented
Spring controllers/services/repositories separate HTTP, business rules and storage.
JPA handles aggregates; JdbcTemplate provides explicit scoped fulfillment queries
and locks. PostgreSQL is authoritative; H2 accelerates tests without proving actual
PostgreSQL locking or compatibility. Additive Flyway preserves committed migrations.

## Original requirements and implementation

Classifications distinguish literal compliance, functional equivalence, approved
deviation and gap. Compound tasks can have several classifications. Tests below
are executable repository evidence; fresh aggregate results are recorded separately.
Historical Postman evidence is not fresh browser or Production acceptance.

### T01: project setup

Requested a Git/Vite/React project with Redux/Thunk, Router 5, Tailwind, Axios,
notifications/icons and hosting. `package.json`, `main.jsx`, `App.jsx`, `store.js`,
Vite and workflows establish the execution chain: React mounts the provider/router,
Vite compiles route bundles. Lint, tests and build exercise this foundation.
Classification: literal core setup; current hosting uses the separate accepted
Production branches recorded in the release evidence below.

### T02: Home and shared layout

Requested responsive Home, one Header/Footer, reusable cards and slider, Flex-only
layout and Tailwind-only classes. `src/layout`, `HomePage`, `Slider`, `EditorsPick`,
`CatalogShowcase` and `ProductCard` implement shared navigation and API-backed
sections. Redux requests feed real cards, with loading/errors. Journey tests and
five-width browser checks exercise them. Classification: functional UI coverage;
**literal styling gap** because grid and custom theme/CSS classes also exist.
The accepted design is preserved, without a Flex/Tailwind-only claim.

### T03: Shop

Requested responsive `/shop` with shared layout. `ShopPage` normalizes URL state,
dispatches the catalog thunk and renders status/results/paging. URL identity makes
refresh and Back/Forward reproducible. `actions.test.js`, `query.test.js`, DOM and
real navigation cases cover the flow. Classification: literal route and functional
responsive behavior.

### T04: product-detail layout

Requested a responsive detail page reached from cards. `ProductCard`,
`productDetailRoute.js` and `ProductDetailPage` preserve category/slug/id paths.
The id drives the API read; slugs are descriptive, not identity. Missing products
show failure instead of a fallback item. Route/model tests and browser navigation
verify the journey. Classification: functional equivalent using actual data.

### T05: Contact

Requested a responsive Contact page. `ContactPage` and `ContactForm` extend it
with validated `POST /contact`, `ContactService` and persisted acknowledgement.
This gives an honest submission result instead of implying email delivery.
Contact controller/browser tests cover validation and retry. Classification:
base page implemented; persistence is an extension, email delivery is absent.

### T06: Team

Requested Team with Gökhan Özdemir as Project Manager, the author and team members.
`teamMembers.js` supplies seven contributors to `TeamPage`, `AboutPage` and
`TeamCard`. Dataset/content tests cover the shared presentation. Classification:
**approved deviation**: the named manager item is not literally implemented.
No role, portrait, social profile or employment history is fabricated.

### T07: About

Requested responsive About with common navigation. `AboutPage` uses shared team
data and qualified capstone copy; links reach actual routes. Content tests and
browser route checks cover it. Classification: functional implementation without
invented corporate staffing, scale or commercial outcomes.

### T08: registration

Requested react-hook-form, on-demand roles, Customer/Store validation and an
activation-email message through the external API. `SignupPage`, signup helpers,
role thunks and `auth/AuthService` preserve typed fields and nested Store details.
The server hashes passwords and rejects public Admin signup. Signup helper,
auth-controller and browser role tests verify it. Classification: functional
Spring alternative plus **approved immediate-activation deviation**. No email
verification or misleading sent-email message exists.

### T09: Redux foundation

Requested ordinary Redux, Thunk/Logger and client/product/cart basic actions.
`store.js`, `actions.js`, `reducer.js` retain those concepts, adding query/session/
checkout guards. Thunks call Axios and dispatch committed state. Logger runs only
in development through `redactForLogger`. Action/reducer/redaction tests cover
races and sensitive fields. Classification: functional extension, not a claim that
all current state fields exactly match the sample or that production logs state.

### T10: login

Requested email/password form, login thunk, user state, return navigation, avatar,
remember-me and failure feedback. `LoginPage`, auth actions and the API boundary
implement that chain. Tokens remain in the HTTP session/optional localStorage,
outside Redux user objects. Header derives the avatar from email. Auth, reducer
and journey tests cover success/failure/continuation. Classification: functional
compatibility; original external sample users are not this database's credentials.

### T11: remembered authentication

Requested raw-token `/verify`, renewal and cleanup on invalid authentication.
Startup actions and `api.js` use session-revision guards so late responses cannot
restore another account. Spring accepts raw JWT and additionally Bearer headers.
Auth/session tests cover verification, expiry and changes. Classification: literal
raw-token behavior with a compatible extension.

### T12: categories

Requested category thunk, links, highest-rated entries and gender-grouped navigation.
Category controller/repository data flows to Redux and Header/Shop; Shop sorts category ratings and renders the top five. EditorsPick separately supplies collection links.
Category, query and actual collection-navigation tests verify it. Classification:
compatible consumer behavior. Categories remain flat; subcategories are not invented.

### T13: product list

Requested `/products` returning `{products,total}`, thunk state and loading UI.
Product controller/service/repository, actions and `ShopPage` preserve that shape.
Query identity binds rows and total; old results cannot replace newer queries.
Product/controller and action-race tests cover success/failure/concurrency.
Classification: literal response contract.

### T14: category/filter/sort queries

Requested URL category, text filter and price/rating sorting with combined state.
`query.js`, `ShopFilters`, `ShopPage` and SQL predicates commit one normalized query.
Turkish folding is symmetric; LIKE punctuation is literal; filtering precedes paging.
Query, product/PostgreSQL and browser tests cover combinations and stale responses.
Classification: compatible extension. A new Header search deliberately escapes
inherited restrictions; deliberate refinements preserve the independent search.

### T15: pagination

Requested limit/offset pagination or infinite scrolling. `pagination.js` supplies
numbered pages (default limit 25), the server supplies filtered totals and stable
id ties. URL/boundary/browser tests cover refresh/navigation/reset. Classification:
literal supported pagination choice; infinite scrolling was an alternative.

### T16: detail data

Requested `/products/:id`, loading, real content and Back. `fetchProduct` and
`ProductDetailPage` normalize known fields using the route id. Detail/slug/model
and journey tests verify loading/failure/direct links. Classification: compatible
implementation; unsupported variants/reviews/attributes are not fabricated.

### T17: adding to cart

Requested Redux cart, repeat-add increments and dropdown. `AddToCartButton`,
`cartActions`, reducer and `CartDropdown` share product identity. Canonical reads
validate adds; concurrent clicks share a read, later intentional adds increment
within stock/quantity bounds. Cart/session/reducer and browser tests cover this.
Classification: functional extension with bounded same-browser persistence.

### T18: cart page

Requested item list, quantity changes, removal and purchase selection. `CartPage`,
cart helpers and reducer derive selected totals from the same state used by Header
and checkout. Utility/DOM and desktop/mobile cases verify it. Classification:
functional implementation; there is no server or cross-device cart domain.

### T19: order summary

Requested product total, shipping, discount, grand total and Create Order.
`OrderSummary` calls `calculateCartTotals`; current callers leave shipping/discount
at zero. They are demonstration rows, not freight/tax/promotion policy. Cart utility
and DOM tests cover arithmetic/navigation. Classification: functional summary;
nonzero shipping/discount policy remains an explicit gap.

### T20: address step

Requested protected checkout, address CRUD, shipping/receipt and city/district/
neighborhood/address fields. `OrderPage`, `AddressForm`, `CityCombobox`, owned
actions and address services connect the flow. DTOs use title/name/surname/phone/
city/district/neighborhood plus update id. Combined street/building/door text stays
in `neighborhood`; there is no extra mandatory `address`. Ownership uses the
principal. Two-user address tests and keyboard/browser cases cover edits/selections.
Classification: functional combined-field equivalent; 81 provinces, partial
dependent suggestions and manual/non-Turkish fallback.

### T21: saved cards

Requested saved-card list/CRUD with full-number fields. Legacy endpoints remain;
current UI reads `/user/card/summary` and masks mutation responses before Redux.
`CardForm`, card helpers and services validate expiry (current month valid).
Card/resource tests cover masking, ownership and expiry. Classification: compatible
demo behavior with a **commercial-security blocker**: full PAN is still stored/
returned by legacy APIs. No CVV persistence, provider charge or PCI claim exists.

### T22: order completion

Requested address/date/card/price/products POST, confirmation and reset. `OrderPage`
sends typed address/date/price/products and optional UUID with no PAN/CVV.
`OrderService` verifies ownership, locks products in id order, computes canonical
BigDecimal totals and commits inventory/order/snapshots/shipments atomically.
PostgreSQL replay/race/rollback tests inspect database effects. Classification:
**approved safer payment-payload deviation** and server extensions. `order_date`
and optional legacy `request_id` contracts remain. Only confirmed original purchased
lines/quantities are consumed; later cart edits are protected.

### T23: previous orders

Requested protected account-menu history, GET and expandable details. `OrdersPage`,
`OrderDetails`, `ShipmentDetails` and `OrderResponse` show stored snapshots and
disclose missing historical data. Responses retain id/order_date/price/products and
line product_id/count/detail. Controller and real history cases verify ownership.
Classification: compatible implementation with snapshot/shipment extensions; no
PAN/CVV in history and no customer shipment actor ids.

## Development timeline

Dates are Git author dates unless labeled as verification records, not estimates
of effort. Older July audit text was committed later; its stated activity date is
not a July Git commit. Board planning dates also do not establish implementation.
For enhancement development, links identify implementation and regression evidence;
the dates record authoring/local checks, not publication. Deployment identity is
established separately by the 30 October cutoff checkpoint.

| Date | Evidence | Technical purpose |
| --- | --- | --- |
| 2026-01-27 | `54684d4`, `57dfeae`, `4de0f81` | Scaffold/Home and Tailwind v4/Vercel setup |
| 2026-03-07 | `28b2fba` through `875a0c0` | Shop/detail routing, Contact/Team/About |
| 2026-07-21 | Retained dated audit text committed later | Historical query/session repair snapshot, not verified July commit chronology |
| 2026-09-21 | `a4e686e` | Complete T01-T23 frontend integration |
| 2026-09-22 | `04c69a2`, `15ce012`, `e335d72` | History/checkout fixes and Spring foundation |
| 2026-09-23 | `533b163`, `4729cf9`, `9bd1e51` | PostgreSQL/Flyway, catalog and JWT |
| 2026-09-26 | `91f60a1`, `d4e9f63` | Owned resources and transactional orders |
| 2026-09-27 | `3b02fff`, `e823c20`, `ae4322a` | PostgreSQL CI, Docker/Render and cutover stabilization |
| 2026-09-29 | `53b10d8` | Checkout validity/mobile cart; historical authenticated acceptance is separate |
| 2026-10-08/09 | Dated Phase-10A/B records; `7bcf7a1`, `e2b2a67` on Oct 9 | Dependencies, local API and signup hardening |
| 2026-10-16/17 | Dated release records; `173a578`, `13ec2fc` | Approved application identity and documentation-only reconciliation |
| 2026-10-17 | Local development; [P00-P12 traceability](#enhancement-traceability) and [order replay tests](server/src/test/java/com/eciner/ecommerce/order/PostgresOrderIntegrationTests.java) | P00-P12 persistence/content/replay/account/isolation repairs |
| 2026-10-19/20 | Started Oct 19; committed locally Oct 20; [E01-E07 traceability](#enhancement-traceability) and [browser regressions](e2e/enhancements.spec.js) | E01-E07 carts, catalog, city and verified fulfillment |
| 2026-10-20 | Stage 2 local changes | Actor minimization, build/CI configuration and public documentation |
| 2026-10-22 | Frontend CI completed 2026-10-21 23:42:35 UTC / 2026-10-22 02:42:35 Europe/Istanbul | Accepted `main` SHA; 183 tests and lint/build PASS |
| 2026-10-23 | Backend deploy finished 2026-10-22 21:18:01.431462 UTC / 2026-10-23 00:18:01.431462 Europe/Istanbul | Accepted backend SHA LIVE; CI 114 tests/package PASS |
| 2026-10-30 | Final submission cutoff; release identities rechecked | Existing Production selected; QA/Zod and local slider work excluded |

Internal backend phases 1-10 are foundation, persistence, catalog, JWT, owned
resources, transactional orders, PostgreSQL CI, deployment, frontend cutover and
hardening/documentation. Their numbering differs from academic Txx. P/E packages
extend the delivered architecture rather than inventing new original tasks.

## Frontend architecture

`main.jsx` mounts the provider; App/shared layout wraps lazy `PageContent` routes.
Protected routes wait for session verification. Fulfillment UI checks capability,
while database authorization remains decisive. One Header/Footer serves every page.

`actions.js` coordinates Axios reads and serializable errors. Product rows/total/
status share normalized query identity; request ids and session revisions guard
late callbacks. Query-keyed deduplication shares pending equivalent reads. The
bounded HTTP timeout accommodates historical Render cold starts without treating
a timeout as proof that a mutation did not commit.

Header search enters unrestricted Shop. Draft refinements remain separate from
applied URL state; chips and a keyboard-operated mobile dialog edit committed
category/collection/price/stock filters. SQL computes the complete matching set.
Detail/cards share canonical model, route, favorite and add helpers.

Favorites persist per owner through V10 and clear/guard responses on session change.
Carts persist bounded ids/quantities/selections/opaque line ids under guest or
account keys; Redux remains the live source. Merge claims avoid repeated guest
merges from stale tabs. The same account restores its cart in this browser; another
account cannot inherit it. Storage is not encrypted and provides no cross-device
or live multi-tab synchronization. API hydration ignores stored prices.

Checkout binds immutable intent UUID/payload to account, session revision and
attempt. `pendingOrder.js` allowlists tab-scoped account/request/product/address ids,
quantities/detail, date and compatibility price; it excludes tokens/passwords/PAN/
CVV/full addresses/full product objects. Original opaque cart-line reservations
prevent late confirmation consuming removed/re-added lines. Lost responses preserve
identity through reload/login. Owned-resource writes distinguish successful mutation
from failed refresh; ambiguous writes require GET reconciliation before another write.

`index.css` defines Montserrat, Tailwind v4 theme variables, reusable controls,
focus-visible and reduced-motion rules. Older hard-coded colors remain. No theme-wide
rewrite was authorized. Responsive/keyboard checks are evidence of tested cases,
not formal WCAG certification or every-device acceptance.

## Backend architecture and authorization

Feature packages cover auth, users, stores, roles, categories, products, addresses,
cards, orders, favorites, contact, fulfillment, health/probe, local demo provisioning
and common errors. Typed controllers validate HTTP input; services own rules and
transaction boundaries; JPA/JdbcTemplate repositories persist/query; DTOs shape
responses. The local demo provisioner is optional and fails closed outside its
explicit isolated profile; ordinary startup needs no provisioner.

Signed JWTs derive ownership from `AuthPrincipal.getUserId()`. Raw and Bearer
headers remain accepted. Password hashes and environment-provided Production secrets
stay server-side. Public signup permits only Customer/Store. Management reloads
current database role/Store; supplied user/actor/store ids cannot grant access.
Foreign owned resources return non-enumerating 404, missing auth 401, forbidden
capability 403, invalid input 400, actual replay/version/stock conflicts 409.
The common HTTP error boundary suppresses SQL and stack traces.

Keyed order requests first lock the owner. Nullable `(user_id,request_id)` uniqueness
and SHA-256 intent fingerprint distinguish replay from changed intent. Sorted product
locks, aggregated quantities and overflow checks precede canonical BigDecimal totals.
Caller-compatible `Instant` order dates or server time are truncated to microseconds.
Inventory, sell_count, order/items, snapshots and shipment groups share one
transaction and roll back together. Unkeyed legacy clients lack duplicate protection.

Only verified `fulfillment_store_id`, not legacy scalar `product.store_id`, authorizes
fulfillment. Admin assignments lock products and append audit. Purchased lines
snapshot ownership; reassignment changes future orders only. Groups split by Store,
with unknown owners in one Admin-managed group. Store projections contain only their
own group lines/address, without other-store lines, order totals or payment data.

Lifecycle: ORDER_PLACED -> PREPARING -> SHIPPED -> DELIVERED. Scoped locked updates
require expected version and UUID, allow one forward step, and require tracking
before shipping. Matching replay adds no event; stale version or changed intent
conflicts. Metadata correction appends audit; Stores cannot change delivered groups,
Admins retain correction capability. Repeatable-read keeps status and history in
one snapshot. Customer responses remove actor ids before serialization; authorized
management retains them. Historical roles are not guessed from current role data.

## Database evolution

Exactly 13 versioned production migrations exist at the accepted source releases.
The test-only repeatable probe is not V14. Stage 2 changed no V1-V13 migration;
Hibernate stays validation-oriented. The cutoff records PostgreSQL 16 with V1-V13;
this documentation task did not query, migrate or write the Production database.

| Version | Evolution and compatibility |
| --- | --- |
| V1 | Roles, categories, products and ordered images |
| V2 | Semantic Admin/Store/Customer seeds |
| V3 | Flat gendered category seeds |
| V4 | Synthetic product/price/stock/rating/sell_count seeds |
| V5 | Stores, users, password hashes, role and optional unique Store association |
| V6 | User-owned addresses and legacy full-PAN cards; no CVV column |
| V7 | Owner orders/items, canonical unit prices and detail |
| V8 | Catalog enrichment and frontend-served SVG URLs, preserving inventory |
| V9 | Nullable product/image/address/currency purchase snapshots |
| V10 | Unique owner/product favorites |
| V11 | Contact submissions with unique UUID |
| V12 | Nullable owner-scoped order request UUID/fingerprint; legacy nulls remain valid |
| V13 | Verified product/line Store associations, assignment audit, shipments/items/events and historical import |

Data never captured cannot be recovered: V9 leaves missing historical snapshots
null; V13 creates an unassigned historical group with import-time HISTORICAL_IMPORT.
It does not infer ownership from legacy-id collisions, invent dispatch dates,
rewrite old totals or create payment data. Purchase snapshots are separate from
editable product/address records and future assignments.

## End-to-end journeys

1. **Customer signup/login:** fetch roles on demand, validate fields, submit,
   hash/persist, show immediate availability, login, install session and return to
   the intended route. Remember-me alone stores a durable token for later verify.
2. **Store signup/login:** validate nested Store fields, persist association and
   login. Registration does not claim existing inventory or historical shipments.
3. **Discovery:** choose a collection/category or global query, normalize URL,
   apply SQL filters/stable sort/paging, render real cards, open detail by id.
   Loading/failure remain visible; errors never become a false product fallback.
4. **Cart/auth:** canonical read before add, persist bounded identities, select
   quantities, redirect protected checkout, merge guest lines once, revalidate.
   Logout hides account cart; other accounts cannot settle its pending intent.
5. **Checkout:** fetch owned address/masked card summaries, select receipt/shipping,
   validate transient demo UI, create one no-payment UUID intent, submit, calculate
   server total and atomically commit inventory/order/snapshots/shipments; render
   persisted confirmation and consume original purchased lines only.
6. **Recovery:** retain an uncertain UUID after transport/authentication errors,
   restore for its account, reconcile history or retry identical payload, settle
   once. Creating a replacement purchase is not the automatic retry strategy.
7. **Addresses:** select saved or searchable province, retain manual detail fallback,
   use owner CRUD, distinguish mutation from refresh outcomes. Keep combined DTO.
8. **History:** authenticated GET `/order`, select stored snapshot, lazily expand
   shipments, verify purchasing owner, read one consistent customer-safe timeline.
9. **Ownership:** Admin assigns a real registered Store with immutable assignment
   audit; new purchased lines snapshot it; old groups retain their association.
10. **Shipments:** Store lists only its groups, submits next status/tracking/version/
    UUID; lock validates and appends one event. Competing editor receives conflict.
11. **Admin:** separately controlled account manages all/unassigned historical
    groups and audited corrections without public signup or a live carrier claim.

## Enhancement traceability

| Package | Implemented work | Evidence |
| --- | --- | --- |
| P00 | Baseline/contract/privacy inventory | Preserved specification, dated records |
| P01 | Theme, fonts, focus/reduced motion | CSS/content/browser checks |
| P02 | Enriched API catalog/Home | V8, product and catalog journeys |
| P03 | Location/receipt/address | AddressForm, V9, address/DOM tests |
| P04 | Masked card summaries/edit reconciliation | Card/resource tests |
| P05 | Stored confirmation/history/selective consumption | Order/reducer/checkout tests |
| P06 | Favorites/search/session guards | V10, favorite/actions/query tests |
| P07 | Supplied team and accurate About | Dataset/content tests |
| P08 | Contact persistence/validation/retry | V11, contact/browser tests |
| P09 | Reachable information/footer | Information/navigation tests |
| P10 | Three original demo articles | Blog content/reading-time tests |
| P11 | Guarded local demo provisioner | Provisioner tests; ordinary startup independent |
| P12 | Review, replay/account/isolation remediation | V12, checkout/PostgreSQL/canary tests |
| E01 | Guest/account bounded cart persistence | cartSession/cartActions, auth/cart cases |
| E02 | Collection-independent global search | HeaderSearch/query/navigation |
| E03 | SQL price/stock filters | Product/PostgreSQL/ShopFilters |
| E04 | Accessible searchable province control | CityCombobox/keyboard/browser |
| E05 | Verified ownership/audited shipments | V13, fulfillment/PostgreSQL/restart/browser |
| E06 | Real collection links | Mouse/keyboard/touch navigation |
| E07 | Preserve responsive theme | Five-width checks and focus/reduced-motion behavior |

## Verification and CI

| Evidence layer | Exact identity / date | Result and boundary |
| --- | --- | --- |
| Production frontend CI | [39695105189](https://github.com/eciner/fsweb0825-ecommerce-project/actions/runs/39695105189), `main` at `87ca72100902c04ef32862ce458c5d62d4831fb8` | 183 tests / 27 files; lint/build PASS; completed 2026-10-21 23:42:35 UTC |
| Production backend CI | [39855500412](https://github.com/eciner/fsweb0825-ecommerce-project/actions/runs/39855500412), `feat/backend-api` at `71ea32c90c1438882abb3c457bfc7a659c8493b3` | 114 tests, zero failures/errors/skips; Maven package PASS; completed 2026-10-22 21:15:04 UTC |
| Historical authenticated Production acceptance | Phase 9, `53b10d82d6b921dea3b919a81f3895a875f860ca`; order creation recorded 2026-10-04 16:35:11.211 UTC / 19:35:11.211 Europe/Istanbul | Purchase/history/inventory acceptance then; not a fresh pass for the cutoff releases or current database contents |
| Historical read-only Production acceptance | Phase 10K, 2026-10-17 00:06 Europe/Istanbul, `173a5786ca41dbef2c9ce0f557900a27d0464323` | Public browser/API checks; no authenticated checkout rerun |
| QA-only frontend | `release/d8-frontend-qa` at `83e2473338047c1868f2cd339a3b1b29d6df69ad` | Recorded 199-test pass and Zod fix; not Production |
| Local-only hero slider autoplay patch | Recorded 204-test pass; no selected Production release identity | Not Production; not included in the submission |

The QA-only delta includes overlapping login/verify race guards, fulfillment
read-error presentation, dependency updates and contact-recovery regression coverage;
these additions are not attributed to Production.

Remote branch heads, CI run SHA/status/log totals, Vercel identity and Render
identity were rechecked on 30 October. No CI run, dependency audit, application
suite or authenticated E2E was initiated by this documentation patch. A recorded
Production demo account does not publish its credentials or establish a current
login test. **Fresh authenticated E2E for the selected releases: UNVERIFIED.**

Public-link checks reached the selected storefront and all linked GitHub run pages.
The API `/health` checks timed out (one 12-second HEAD and one 30-second GET);
**fresh HTTP health availability is UNVERIFIED in this documentation review**.
Render's LIVE metadata remains independently confirmed. Original external assignment
resources with 404/403 responses are disclosed in the editorial annotation in
[project-phases.md](project-phases.md); their original URLs remain preserved.

Historical Stage 2 frontend checks on 2026-10-20 used Node 22.19.0/npm 10.9.3:
lint, **183 tests in 27 files**, and explicit-loopback-target build passed.
Focused Java shipment verification passed **12 tests**, zero failures/errors/skips.
The assembled clean candidate worktree independently passed the full Java 21
clean verify (112 tests, including 23 PostgreSQL; zero failures/errors/skips),
executable JAR packaging and the complete E2E command: four isolation checks,
one restart/persistence test and 27 Edge cases, including 130 route/viewport
combinations. These are local candidate results, not Production acceptance.

Pure helpers/reducers prove normalization/state transitions; DOM tests drive forms,
focus and failed requests; H2 controller tests verify HTTP/ownership; Testcontainers
PostgreSQL 16 establishes actual migration/lock/replay/rollback behavior. Edge
Playwright drives frontend through the API into disposable PostgreSQL. Four isolation
checks exercise hostile inherited datasource/config/JVM state and fabricated
connections. A real API restart case checks persisted fulfillment. The five-width
suite checks 26 routes, 130 combinations, not 130 independent test cases.

Both CI workflows declare `contents: read`; checkout/testing needs no write
token. Frontend CI supplies an explicit local build API target. The October 20
candidate checks preceded the exact-release remote CI listed above. Historical
Phase-10 counts of 73 frontend tests and Stage 2 counts of 112 backend tests belong
to those sources/dates; the accepted backend CI has 114. Local verification is not
a deployed release, penetration assessment or accessibility certificate.

## Deployment evolution and release gates

| Component | Production identity at 30 October 2026 | Public endpoint |
| --- | --- | --- |
| Vercel frontend | `main` — `87ca72100902c04ef32862ce458c5d62d4831fb8`; `dpl_HCF6rn5MPUVKjtfPsQuBZVeQURp3`, READY | [Storefront](https://fsweb0825-ecommerce-project.vercel.app/) |
| Render backend | `feat/backend-api` — `71ea32c90c1438882abb3c457bfc7a659c8493b3`; `dep-dbd7put9fdbs73ao5io0`, LIVE | [API health](https://fsweb0825-ecommerce-api.onrender.com/health) |
| Render database | PostgreSQL 16, available; Flyway V1-V13 in accepted source | Free database expiration listed as 2026-11-20; no connection details published |

The frontend serves React 19/Vite 7/Redux/Axios; the separate backend serves Java 21 /
Spring Boot 3.4.13 / Security JWT / JPA and JdbcTemplate / PostgreSQL. Comparing the
accepted refs shows identical `server/` trees; their whole-repository trees differ
because frontend and backend branches serve different release responsibilities.
A different full commit SHA is not itself a contract mismatch.

Historical application `173a5786ca41dbef2c9ce0f557900a27d0464323` and documentation
`13ec2fc39971d69944a1f264a3d8c10a1d8cb761` remain prior milestones. The earlier
October 20 candidate sequence was assets -> compatible backend/V8-V13 -> frontend,
with separate review/backup/acceptance gates. V8 catalog URLs depend on frontend
`/catalog/*.svg`. Those planning records do not replace the current identities or
prove backup/restore readiness. Clean publication histories excluded private material;
this reconciliation does not rewrite or publish the retained private histories.

The owner selected this existing Production for academic submission. QA at
`83e2473338047c1868f2cd339a3b1b29d6df69ad` and the local slider patch remain
outside it. Render Free cold starts and the database's listed 20 November expiration
are operational limitations. Latest authenticated browser acceptance, durable
backup/restore and rollback readiness are not established by metadata or CI.
This reconciliation changes documentation only. Publishing the documentation does
not change the accepted application release identities recorded above or establish
new application acceptance. The reconciliation involved no cloud configuration,
database, account, order, branch merge or deployment action.

## Security, provenance and technical assessment

Server price authority, locked inventory, transaction rollback, owner-scoped access,
keyed replay, immutable snapshots and role-scoped audit projection are implemented
and testable. Legacy full-PAN card persistence/API exposure blocks commercial
payments. Legacy PAN has no application-level encryption/tokenization; immediate
activation proves no email ownership.
Contact throttling is process-local; proxy trust/login throttling and Postman
expansion remain future work. No V14, payment provider, email or carrier integration
is included. Historical unknown ownership remains Admin-managed.

Montserrat's OFL notice remains; each dependency has its own terms. No root project
LICENSE exists. Legacy image/Figma-derived rights are **UNKNOWN / REQUIRES USER
REVIEW**; accessibility from a community link does not prove redistribution rights.
Synthetic catalog assets do not grant rights over historical imagery. The owner
must decide licensing/publication rights before unqualified redistribution or
commercial use. Academic literal acceptance, operational acceptance and commercial
readiness remain distinct decisions.


## Source evidence index

| Boundary | Implementation | Repeatable evidence |
| --- | --- | --- |
| Routes/session | [PageContent](src/layout/PageContent.jsx), [HTTP boundary](src/services/api.js) | [DOM journeys](src/tests/journeys.dom.test.jsx), [auth tests](server/src/test/java/com/eciner/ecommerce/auth/AuthControllerTests.java) |
| Catalog queries | [normalization](src/utils/query.js), [SQL predicates](server/src/main/java/com/eciner/ecommerce/product/ProductQueryRepositoryImpl.java) | [query tests](src/utils/query.test.js), [product tests](server/src/test/java/com/eciner/ecommerce/product/ProductControllerTests.java) |
| Cart/recovery | [cart persistence](src/store/cartSession.js), [checkout state](src/store/checkoutState.js), [pending intent](src/store/pendingOrder.js) | [cart tests](src/store/cartSession.test.js), [checkout safety](src/tests/checkoutSafety.dom.test.jsx) |
| Order transaction | [OrderService](server/src/main/java/com/eciner/ecommerce/order/OrderService.java) | [PostgreSQL orders](server/src/test/java/com/eciner/ecommerce/order/PostgresOrderIntegrationTests.java) |
| Fulfillment/privacy | [ShipmentService](server/src/main/java/com/eciner/ecommerce/fulfillment/ShipmentService.java), [projection](server/src/main/java/com/eciner/ecommerce/fulfillment/ShipmentView.java) | [shared HTTP tests](server/src/test/java/com/eciner/ecommerce/fulfillment/FulfillmentControllerTests.java), [PostgreSQL upgrade](server/src/test/java/com/eciner/ecommerce/fulfillment/PostgresFulfillmentIntegrationTests.java) |
| Real browser/isolation | [stack fixture](e2e/local-stack.js), [disposable database](e2e/disposable-postgres.js) | [browser enhancements](e2e/enhancements.spec.js), [canaries](e2e/isolation.test.js), [restart](e2e/shipment-restart.test.js) |


## Asset and dependency provenance review

The owner approved keeping unresolved licensing documented for later review on
2026-10-20. No root LICENSE is created or assigned. Privacy/security publication
checks are separate from intellectual-property clearance. Existing imagery is
preserved; no image is removed merely because rights are unverified.

| Specific material | Available evidence | Rights status / redistribution consideration |
| --- | --- | --- |
| `public/fonts/montserrat-latin.woff2`, `montserrat-latin-ext.woff2`, `OFL.txt` | Bundled OFL 1.1 notice names the Montserrat.Git Project Authors; CSS selects Montserrat | License notice verified present and retained; this is not certification of all font provenance/obligations |
| `public/catalog/black-dress.svg`, `black-jacket.svg`, `blue-shirt.svg`, `brown-shoe.svg`, `camel-coat.svg`, `green-skirt.svg`, `green-tee.svg`, `grey-jacket.svg`, `ivory-blouse.svg`, `navy-bag.svg`, `navy-dress.svg`, `navy-jacket.svg`, `red-dress.svg`, `sand-trousers.svg`, `tan-bag.svg`, `white-shoe.svg` | Added as demo illustration assets in the October enhancement source; retained in the assets candidate; XML checks find no script or external image reference | Git provenance and technical content verified; no root license grants unrestricted third-party reuse |
| `src/assets/editors-men.png`, `editors-women.png`, `hero-woman.jpg`, `hero-woman-2.png`, `hero/hero-product.png`, `banners/banner-neural.jpg` | First recorded in `57dfeae` on 2026-01-27; actual component imports and production build include them | UNKNOWN / REQUIRES USER REVIEW; Git introduction does not establish photographer/model/design redistribution permission |
| `src/assets/editors-accessories.png`, `editors-kids.png`, `hero/hero-product-2.png`, `posts/post-1.jpg`, `posts/post-2.jpg`, `posts/post-3.jpg` | Same initial Git record; retained historical material, not current direct imports | UNKNOWN / REQUIRES USER REVIEW; tracked assets still redistribute with a repository even when absent from bundles |
| `src/assets/products/product-1.jpg`, `product-2.jpg`, `product-3.jpg`, `product-4.jpg`, `product-5.jpg`, `product-6.jpg`, `product-7.jpg`, `product-8.jpg` | Same initial Git record; retained historical product imagery | UNKNOWN / REQUIRES USER REVIEW; runtime non-use is not a redistribution license |
| `public/vite.svg` | Scaffold-era starter favicon; `index.html` still references it | Retained; no asset-specific grant was established by this review. Upstream mark/art terms need owner review |
| Original Figma reference in the specification | Community design URL and historical local visual-review records | UNKNOWN / REQUIRES USER REVIEW; no inferred assignment of ownership or permission to redistribute source exports |
| Gravatar URL in `src/layout/Header.jsx` | Runtime avatar request using an email hash; no portrait copied into the repository | External-service/privacy and image terms remain applicable; no portrait redistribution right is asserted |

All 20 legacy raster files remain. Figma source exports are not required public
build inputs and are preserved locally. Unused React starter SVG removal was
based on proven non-use, separately from licensing. The retained Vite favicon is
still used. Catalog/file availability does not grant rights in unrelated imagery.

Installed metadata for all **32 direct npm dependencies/devDependencies** was read:
30 declare MIT, `lucide-react` declares ISC and `@playwright/test` declares Apache-2.0.
Each inspected direct package contains a root LICENSE/license notice (Playwright
also has NOTICE). Exact resolved versions remain in `package-lock.json`; no
license-driven dependency change occurred. These are package metadata/notice
observations, not a complete transitive dependency or distribution-obligation audit.

Selected packaged Java dependency versions were read from the executable JAR and
license declarations from their cached Maven POMs, following parent POMs as needed:

| Dependency/version | Declared license evidence |
| --- | --- |
| Spring Boot 3.4.13, Spring Core 6.2.15, Spring Security Core 6.4.13 | Apache License 2.0 |
| Flyway Core 10.20.1, JJWT API 0.12.6, HikariCP 5.1.0 | Apache License 2.0 |
| Hibernate Core 6.6.39.Final | GNU Library General Public License 2.1 or later |
| PostgreSQL JDBC 42.7.8 | BSD-2-Clause |
| Testcontainers 1.20.6 (test dependency) | MIT |

Dependency grants do not license application code, Figma-derived work or photographs.
The owner retains the root-license decision and must resolve asset permissions and
applicable attribution/source/notice obligations before claiming unrestricted
redistribution or licensing compliance. This review neither certifies compliance
nor authorizes replacing/removing the preserved assets.


## Historical local candidate QA — 2026-10-20

These results preserve the October 20 candidate snapshot. The current selected-release
CI is listed above; later 199/204-test results remain QA/local only.

| Gate / actual command | Observed result |
| --- | --- |
| `npm.cmd ci --no-audit --no-fund` in isolated public-source worktree | PASS, 314 packages installed; lockfile unchanged by installation |
| `npm.cmd run lint` and `npm.cmd test` | PASS; 183 tests, 27 files |
| `npm.cmd run build` with explicit loopback API | PASS; dist generated, required SVG/font/notice assets retained |
| Build with VITE_API_URL absent in clean worktree | Expected fail-closed error; explicit target then builds successfully |
| Java 21 Maven Wrapper `-B clean verify` | PASS; 112 tests, 23 PostgreSQL, zero failures/errors/skips; executable JAR |
| Fresh V13, synthetic V7-to-V13 and V12-to-V13 | PASS; canonical totals/inventory, historical import, snapshots/favorites/contact and unknown ownership preserved |
| `npm.cmd run test:e2e` | PASS; 4 canaries, 1 restart test, 27 browser cases; 130 route/width combinations |
| Candidate B/C server comparison | 132 files byte-identical; backend was not blindly replaced over a different published baseline |
| Historical migration comparison | Published V1-V7 and original enhanced V1-V13 match after newline normalization; no migration edited |
| Public Markdown checks | Relative targets/anchors and original-task preservation checked; no public links to private plans |
| Public HTTP links | Storefront HTTP 200; API health unverified after bounded requests, without cloud/DB access |

Initial sandbox runs could not read esbuild's ancestor path or access Maven Central;
normal-owner reruns passed. The primary checkout's running JAR blocked Maven clean,
so isolated builds preserved that process/data. The first restart test compared a
management projection before restart with a customer projection afterward. It was
corrected to compare each projection across restart, preserve the full management
audit comparison, and assert customer actor-id absence; the full E2E command then
passed. No regression assertion was removed to hide that contract distinction.

Observed warnings: npm deprecated `whatwg-encoding` and `deep-diff`; the browser
runner reported NO_COLOR/FORCE_COLOR interaction; Java/Mockito emitted agent/CDS
warnings in focused execution. These did not fail the observed gates. No fresh
vulnerability audit, full transitive-license certification, formal accessibility
assessment, Production backup or deployed authenticated purchase test is claimed.

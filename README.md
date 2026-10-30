# FSWEB0825 E-Commerce

A WorkinTech capstone that grew from a React storefront consuming an external API
into a React/Spring Boot/PostgreSQL application. Customers discover products and
place demo orders, Stores manage verified shipment groups, and Admins assign
fulfillment ownership and manage unassigned or historical shipments.

**Academic submission cutoff: 30 October 2026 (Europe/Istanbul).** The owner selected
the existing Production application. Frontend and backend deploy from separate branches;
their different commit identities are intentional.

| Production component | Exact accepted release | Deployment / verification |
| --- | --- | --- |
| [Frontend](https://fsweb0825-ecommerce-project.vercel.app/) | `main` — `87ca72100902c04ef32862ce458c5d62d4831fb8` | Vercel `dpl_HCF6rn5MPUVKjtfPsQuBZVeQURp3`, READY |
| [Backend](https://fsweb0825-ecommerce-api.onrender.com/health) | `feat/backend-api` — `71ea32c90c1438882abb3c457bfc7a659c8493b3` | Render `dep-dbd7put9fdbs73ao5io0`, LIVE |
| Database | Render PostgreSQL 16; Flyway V1-V13 | Available; Free database expiration listed as **20 November 2026** at cutoff |
| Frontend CI | [39695105189](https://github.com/eciner/fsweb0825-ecommerce-project/actions/runs/39695105189), exact `main` SHA | 183 tests; lint/build PASS |
| Backend CI | [39855500412](https://github.com/eciner/fsweb0825-ecommerce-project/actions/runs/39855500412), exact accepted backend SHA | 114 tests, zero failures/errors/skips; Maven package PASS |

These release identities and CI records were checked on 30 October. The QA branch
`release/d8-frontend-qa` at `83e2473338047c1868f2cd339a3b1b29d6df69ad`, its
199-test result and Zod fix are **QA-only, not Production**. The local hero slider
autoplay patch with 204 passing tests is also **not Production**.

No independent fresh authenticated browser E2E pass is claimed for the selected
releases. Historical Phase 9 purchase/history acceptance was recorded on
**4 October 2026**, with order creation at **16:35:11.211 UTC / 19:35:11.211
Europe/Istanbul**, for `53b10d82d6b921dea3b919a81f3895a875f860ca`.
It does not establish current account, order or inventory state. See
[release evidence](PROJECT_DETAILS.md#verification-and-ci) for evidence boundaries.

**Demo payment only.** No gateway captures money. Legacy saved-card endpoints still
store and return full PAN for compatibility. This is a commercial-security blocker;
the application is not PCI compliant. Use synthetic data only. Current checkout
omits PAN/CVV from the order request; order history never persists them.

## Capabilities

- API-backed catalog, Turkish-aware global search, collection/category/price/stock
  filters, stable sorting and numbered pagination.
- Product details, persistent owned favorites and bounded same-browser guest/account
  carts with canonical revalidation and merge-once login.
- Customer/Store signup, JWT login and remembered verification. Public Admin signup
  is rejected. Registration activates accounts immediately.
- Owned addresses, masked card summaries, 81-province city search, optional receipt
  address, transactional checkout and uncertain-result recovery.
- Purchase snapshots, owner-scoped order history, multi-store shipment groups and
  persisted lifecycle events with authorized management audit views.
- Persisted contact requests, demo journal articles and qualified information pages.

## Architecture

```text
React 19 / Vite 7 / Router 5 / Redux + Thunk / Axios
                       |
              Spring Security + JWT
                       |
Spring Boot 3.4.13 / Controllers -> Services -> JPA or JdbcTemplate repositories
                       |
              PostgreSQL 16 / Flyway V1-V13
```

| Path | Responsibility |
| --- | --- |
| `src/layout`, `src/pages`, `src/components` | Shared navigation, lazy routes, customer/management UI |
| `src/store` | Session, cart, query guards, resources and checkout lifecycle |
| `src/services`, `src/utils`, `src/data` | HTTP boundary, contracts and editorial/location data |
| `public/catalog`, `public/fonts` | 16 catalog SVGs and Montserrat with its OFL notice |
| `server/src/main/java/com/eciner/ecommerce` | Feature-oriented API |
| `server/src/main/resources/db/migration` | Immutable additive V1-V13 migrations |
| `server/src/test`, frontend test files, `e2e` | H2/PostgreSQL, Vitest/DOM and isolated Edge verification |
| `.github/workflows` | Frontend validation and backend PostgreSQL/package CI |

## Prerequisites

Use Node.js 22 (`.nvmrc`; verified 22.19.0/npm 10.9.3), Java 21, PostgreSQL 16 and
the checked-in Maven Wrapper. The Node engine minimum is 20.19.0. No global Maven
is needed. Full backend tests require Docker. Browser E2E additionally requires
Windows Docker Desktop's local Linux engine, Microsoft Edge and free loopback ports
8083/8084/5176. The harness deliberately accepts local Windows named pipes only; Linux
browser-harness support is not claimed. Ordinary frontend/backend startup is not
restricted to that E2E platform.

## Safe local startup

Use separate fresh checkouts for the deployed branches and a new disposable local
database. Run frontend commands in the `storefront` checkout and backend commands in
`api/server`; neither QA nor a local slider patch is part of this setup.

```powershell
git clone --branch main --single-branch https://github.com/eciner/fsweb0825-ecommerce-project.git storefront
git clone --branch feat/backend-api --single-branch https://github.com/eciner/fsweb0825-ecommerce-project.git api
```

Compare each checkout's `git rev-parse HEAD` with the cutoff table before reproducing
that release; moving branch heads may later differ. The PowerShell database examples
require your own local PostgreSQL administrative access. They contain no supplied
password. Never use a Production connection or an existing demo database. Stop if
the proposed database already contains data.

```powershell
npm.cmd ci
createuser --host 127.0.0.1 --username postgres --pwprompt ecommerce_local
createdb --host 127.0.0.1 --username postgres --owner ecommerce_local ecommerce_local
```

In a terminal opened at the `api` checkout root (PowerShell 7.2+ for secure
input/random-secret helpers):

```powershell
$env:JAVA_HOME = '<your Java 21 installation>'
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = '5432'
$env:DB_NAME = 'ecommerce_local'
$env:DB_USER = 'ecommerce_local'
$env:DB_PASSWORD = Read-Host 'Local database password' -MaskInput
$env:JWT_SECRET = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:CORS_ALLOWED_ORIGINS = 'http://localhost:5173'
Set-Location server
.\mvnw.cmd -version
.\mvnw.cmd spring-boot:run
```

Other shells can provide equivalent environment variables. The default `local`
profile reads the DB variables and `JWT_SECRET`; Flyway initializes the new schema
through V13 and Hibernate validates it. No private startup helper or demo provisioner
is required. The seeded catalog has no ready-to-use user accounts. Register a
Customer/Store in the UI. Admin access needs separately controlled local provisioning;
there is no public Admin signup or supplied Admin password.

In another terminal at the `storefront` checkout root:

```powershell
Copy-Item .env.example .env
npm.cmd run dev
```

The template targets `http://localhost:8080`; Vite normally uses
`http://localhost:5173`. If that port changes, update the backend's exact
`CORS_ALLOWED_ORIGINS` and restart it. `127.0.0.1` and `localhost` differ. Multiple
origins are comma-separated; wildcards are rejected. Check `GET /health` on port 8080.

Never put secrets in `VITE_` variables: they become browser code. Production builds
fail if `VITE_API_URL` is missing/malformed. Set an explicit local verification URL
or the intended HTTPS Render target. Environment changes require rebuilding Vite.

## Verification

```powershell
# Repository root
npm.cmd run lint
npm.cmd test
$env:VITE_API_URL = 'http://127.0.0.1:8083'
npm.cmd run build

# server/ in the checkout being tested, Java 21 and local Docker available
.\mvnw.cmd -B clean verify

# storefront root, after packaging storefront/server for this harness
npm.cmd run test:e2e
```

`clean verify` runs tests and creates `server/target/ecommerce-api-0.0.1-SNAPSHOT.jar`.
The conventional `.\mvnw.cmd clean test` then `.\mvnw.cmd package` gates are also
supported. Backend-only checks can run in `api/server`. The browser harness reads
its JAR from `storefront/server/target`, so package that checkout before E2E; its
`server/` tree matches the accepted backend source at cutoff. Maven Wrapper output
establishes the backend Java version; a bare global
`java -version` can select another JDK.

E2E runs four isolation checks, one API restart/persistence test and Playwright.
The fixture issues a new PostgreSQL 16 container with random credentials/owner label,
verifies its loopback binding and launches Java with a minimal environment and
explicit datasource/Flyway settings. It verifies V13 and deletes only its owned
container. It never accepts an arbitrary database URL. Do not repoint it at persistent
data. `E2E_DOCKER` can identify a trusted executable when discovery/PATH is insufficient;
the context must still be an accepted local named pipe. Edge is selected in the
checked-in configuration. No external API account or private helper is needed.

See [PROJECT_DETAILS.md](PROJECT_DETAILS.md#verification-and-ci) for exact-release CI
and dated local evidence. The commands above are repeatable local checks; they were
not rerun as application tests for this documentation-only reconciliation. Historical
totals refer to earlier code. Local PASS does not establish deployed acceptance,
Production backup readiness, penetration testing or formal accessibility certification.

## Contracts and deployment

Public routes include Home, Shop and category/detail paths, favorites, cart, auth,
About/Team/Contact, journal and information pages. `/order`, `/orders` and
`/fulfillment` require authentication; management authorization is enforced server-side.
The [Postman collection](postman/fsweb0825-ecommerce.postman_collection.json) covers
original contracts and predates the newest enhancement endpoints.

Catalog queries support `category`, `gender` (`k`/`e`), `filter`, `sort`, `limit`,
`offset`, `min_price`, `max_price`, `in_stock`. Raw JWT and Bearer headers both work.
Address/card CRUD remains under `/user`; orders use POST/GET `/order`. Client
`price` is compatibility input. Optional owner-scoped UUID `request_id` enables
identical replay; legacy unkeyed calls remain valid without duplicate protection.
Customer shipment reads use `/order/{id}/shipments`; management uses `/fulfillment/*`.

Git shows scaffold/Home in January 2026, Shop/content in March, full storefront
and Spring API phases in September, and hardening/release in October. P00-P12 followed
October 17; E01-E07 were developed October 19-20. The
[detailed timeline](PROJECT_DETAILS.md#development-timeline) distinguishes authoring,
commit and observed verification dates.

Production architecture at cutoff is Vercel `main` -> Render `feat/backend-api` ->
PostgreSQL 16/Flyway V1-V13, using the URLs and exact identities above. Java 21 and
Boot 3.4.13 remain the accepted backend baseline. Historical candidate rollout
ordering is retained in [project details](PROJECT_DETAILS.md#deployment-evolution-and-release-gates);
this documentation change does not authorize another release.

## Limits and troubleshooting

- T06 retains seven supplied contributors; T08 uses immediate activation; T22 omits
  sensitive payment fields. These are approved departures. Styling also uses grid
  and custom CSS; summary shipping/discount remain zero-valued demo calculations.
- Carts are bounded same-browser storage, not encrypted or cross-device. Historical
  orders may lack snapshots; unverified shipments remain Admin-managed. No carrier
  dispatch, email delivery, payment capture or legal-compliance claim is made.
- Render Free service cold starts can delay initial requests. Database availability
  and the listed expiration are cutoff observations, not a durability or backup
  guarantee; backup/restore readiness is not independently established here. Bounded
  `/health` requests timed out during this documentation review, so a fresh HTTP
  health PASS is not claimed alongside the confirmed Render LIVE metadata.
- Production demo-account existence is recorded operationally; credentials are not
  distributed in these documents. Seeded local data is a separate setup concern.
- Additional login/verify race guards, fulfillment read-error handling and dependency
  fixes remain on the excluded QA branch; see the unshipped repairs ledger.
- Contact throttling is process-local. Login/signup throttling and expanded Postman
  coverage remain future work.
- Montserrat retains its [OFL notice](public/fonts/OFL.txt). Historical image/Figma
  rights are **UNKNOWN / REQUIRES USER REVIEW**. No root project LICENSE grants a
  general reuse license. The owner must decide licensing; package licenses do not
  license the application's own material.
- A running service can lock the backend JAR and block Maven `clean`. Stop only a
  process you own or build in an isolated clean checkout. Keep Docker available for
  the full suite. For CORS errors compare the exact browser origin; for production
  build errors set the API target. For uncertain orders use the existing recovery
  identity rather than creating a replacement purchase.

## Documentation

- [PROJECT_DETAILS.md](PROJECT_DETAILS.md): tasks, architecture, schema, journeys,
  timeline, verification and release gates.
- [FIXES-IMPLEMENTED.md](FIXES-IMPLEMENTED.md): repairs, root causes and regressions.
- [PROJECT_EXTRAS.md](PROJECT_EXTRAS.md): additions compared with the assignment.
- [project-phases.md](project-phases.md): original T01-T23 and explicit annotations.
- [project-progress.md](project-progress.md): retained historical checkpoints.

Development used engineering assistance including AI tools. Factual authorship and
technical evidence are retained without publishing private operating prompts or
local agent configuration.

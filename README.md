# fsweb0825 E-Commerce Project

React + Vite e-commerce project for WorkinTech Bootcamp.

## Current Phase Status

- Internal Phases 1-9 are complete. WorkinTech T01-T23 implementation and verification are recorded in [project-phases.md](project-phases.md), with explicit notes where the approved application differs from the original assignment.
- Phase 10 application hardening and the Production release were verified through Phase 10K. Phase 10L identified documentation defects; Phase 10M corrects them locally. Documentation review, commit/delivery verification and final academic submission close-out remain pending.

## Approved Application Release and Verification

Repository: [eciner/fsweb0825-ecommerce-project](https://github.com/eciner/fsweb0825-ecommerce-project).

Both deployment records identify the approved application SHA `173a5786ca41dbef2c9ce0f557900a27d0464323` for the **2026-10-16 Production release**:

| Component | Live URL | Source branch | Verified deployment |
| --- | --- | --- | --- |
| React/Vite frontend on Vercel | [Frontend](https://fsweb0825-ecommerce-project.vercel.app) | `main` | `dpl_3G5vPZdmVSRk3SEPaicLtA1Act7G` — READY |
| Spring Boot API on Render | [API](https://fsweb0825-ecommerce-api.onrender.com) | `feat/backend-api` | `dep-db94gt3bc2fs73blvb10` — live |

Exact-SHA main-push CI from 2026-10-16, both completed/success:

| Workflow | Run | Verified result |
| --- | --- | --- |
| Frontend CI | [38943655647](https://github.com/eciner/fsweb0825-ecommerce-project/actions/runs/38943655647) | 73 tests across 13 files; lint and build PASS |
| Backend CI | [38943655457](https://github.com/eciner/fsweb0825-ecommerce-project/actions/runs/38943655457) | 65 tests; zero failures/errors/skips; package PASS |

Phase 10K read-only Production acceptance covered public catalog/detail/category navigation, login/signup rendering, cart, protected-route redirects, direct refresh and responsive layouts at 375x812, 768x1024 and 1440x900. This acceptance completed on 2026-10-17 Europe/Istanbul. It did **not** retest authenticated checkout on the final application SHA; CI uses isolated test databases. Phase 10M rereads the existing evidence and reviews documentation; it does not rerun CI or Production E2E.

Historical Phase 9: frontend release `53b10d82d6b921dea3b919a81f3895a875f860ca` passed authenticated Production purchase/order-history E2E with exactly one authorized persistent order. At that checkpoint the separately tracked backend branch was `feat/backend-api` at `ae4322a47a807c64d16c3126276ca607003a19fc`. These are historical identities; do not repeat that Production order.

A later documentation-only commit pushed to `main` may produce a new Vercel deployment SHA. Render follows its separate backend source branch and stays at the approved application release unless separately updated. A documentation-only SHA difference does not establish an application-code mismatch; do not redeploy Render merely to align SHAs.

## Frontend Stack

- React
- Vite
- React Router v5
- Vanilla Redux + Redux Thunk + Redux Logger
- Axios
- React Hook Form
- React Toastify
- Lucide React
- Swiper
- Tailwind CSS

The backend in `server/` uses Java 21, Spring Boot, Spring Security/JWT, JPA/Hibernate, PostgreSQL, and Flyway. Its Production API is deployed on Render at `https://fsweb0825-ecommerce-api.onrender.com`.

Architecture: React/Vite at the repository root → Spring Boot 3.4.13 / Spring Security / JWT in `server/` → JPA/Hibernate → PostgreSQL 16. Flyway owns schema initialization and migrations V1-V7; Hibernate validates the schema.

## Local Setup and Verification

Run the commands below from the repository root. Requirements:

- Node.js **20.19+** and npm; **Node 22** is the verified frontend CI runtime.
- A **Java 21 JDK**, selected through `JAVA_HOME`; use the included Maven Wrapper, not a global Maven installation. Adapt the example JDK path to your installation.
- A running **PostgreSQL 16** server and a local database/user. Docker Engine must also be available and running for the full backend PostgreSQL/Testcontainers suite; those tests use disposable containers.

Startup order: **PostgreSQL and database → Spring API and health check → Vite frontend**.

### 1. Create the local database

Start your local PostgreSQL service. If `ecommerce` does not exist, create it once using pgAdmin or the following command with PostgreSQL's `psql` available on PATH. Authenticate with your local PostgreSQL credentials; psql prompts for a password if required:

```powershell
psql -h localhost -p 5432 -U postgres -d postgres -c "CREATE DATABASE ecommerce;"
```

The example uses the local `postgres` user; substitute your own local connection details if needed. Flyway does not create the database or PostgreSQL user. Never use Production credentials for local development or verification.

### 2. Start the Spring API

In the backend terminal, replace the local-only placeholders and set the environment explicitly:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
$env:SPRING_PROFILES_ACTIVE = "local"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "ecommerce"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "your-local-postgres-password"
$env:JWT_SECRET = "local-only-replace-with-at-least-32-ASCII-bytes"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173"
.\server\mvnw.cmd -f server/pom.xml -version
.\server\mvnw.cmd -f server/pom.xml spring-boot:run
```

The wrapper's version output must report Java 21. `JWT_SECRET` must contain at least **32 UTF-8 bytes**; use your own local-only value. The local profile defaults to PostgreSQL at `localhost:5432`, database `ecommerce`, user `postgres`; the explicit variables above make the setup reproducible.

On a new local database, Flyway automatically applies **V1-V7**, including migration-provided demo seeds. On subsequent starts it validates/applies migrations as needed; Hibernate uses `ddl-auto=validate`. Wait for startup, then check from another terminal:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/health"
```

Expected response: `{"status":"UP"}`.

Spring Security reads `CORS_ALLOWED_ORIGINS` and defaults to an **empty origin allowlist**. The explicit local value above permits the normal Vite origin. Do not use wildcards. If Vite selects another port or you use another hostname, set the exact browser origin, such as `http://localhost:5174`, in the backend terminal and restart the API. Scheme, hostname and port must match.

### 3. Start the frontend

In a second terminal at the repository root, create `.env` from the tracked [template](.env.example) on a fresh checkout. If `.env` already exists, preserve it and set only the required local API value instead of overwriting unrelated settings:

```env
VITE_API_URL=http://localhost:8080
```

For a fresh checkout without `.env`:

```powershell
Copy-Item -LiteralPath .env.example -Destination .env
npm.cmd ci
npm.cmd run dev
```

If `.env` already exists, run `npm.cmd ci` and `npm.cmd run dev` after checking its API URL. Open the exact origin printed by Vite and ensure it matches the backend allowlist. Restart Vite after changing its environment.

Vercel Production explicitly uses `VITE_API_URL=https://fsweb0825-ecommerce-api.onrender.com`. Frontend environment variables are public build inputs; never put secrets in them or `.env.example`.

### 4. Verify locally

Read-only catalog smoke check, with the API running:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/products?limit=2&offset=0"
```

Quality commands from the repository root:

```powershell
npm.cmd run lint
npm.cmd test -- --run
npm.cmd run build
.\server\mvnw.cmd -f server/pom.xml clean verify
```

Frontend CI runs `npm ci`, lint, tests and build; Backend CI runs `./mvnw clean package` from `server/` on Java 21. Docker Engine is required for its real PostgreSQL/Testcontainers tests. These existing release results are recorded above; the documentation patch does not claim a new test run.

Backend environment names are `SPRING_PROFILES_ACTIVE`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` and `CORS_ALLOWED_ORIGINS`. Optional `PORT` defaults to 8080 and `JWT_EXPIRATION` defaults to 86400000 milliseconds. Production uses `prod`, Render's existing database wiring and its Vercel origin allowlist; no Production settings need changing for local development.

### Local-only Postman/Newman

For local API contract verification, start the local Spring API and run the tracked collection with synthetic values and a disposable local database. Newman can be run without adding it to project dependencies:

```powershell
$runId = [guid]::NewGuid().ToString("N")
npx.cmd --yes newman@6.2.1 run postman/fsweb0825-ecommerce.postman_collection.json `
  --env-var "baseUrl=http://localhost:8080" `
  --env-var "testEmail=phase10a-$runId@example.test" `
  --env-var "testPassword=Local-$runId-Strong1!" `
  --env-var "cardNo=4111111111111111" `
  --env-var "cardCcv=123"
```

The collection creates temporary local account/address/card data and an order that changes seeded stock. Use a disposable local database and recreate it for a clean rerun. Never provide Production credentials or change `baseUrl` to a remote host; the collection's pre-request guard rejects non-local targets.

## Routing (T23 canonical)

- `/`
- `/signup`
- `/login`
- `/shop`
- `/shop/:gender/:categoryName/:categoryId`
- `/shop/:gender/:categoryName/:categoryId/:productNameSlug/:productId`
- `/about`
- `/team`
- `/contact`
- `/cart`
- `/order` (authenticated)
- `/orders` (authenticated)

## Product Query Model (T14-T15)

Canonical query object:

```js
{
  category: null,
  sort: "",
  filter: "",
  limit: 25,
  offset: 0,
}
```

- API params are built from normalized query values.
- URL search params keep committed controls (`sort`, `filter`, `page`).
- URL/path are navigation source of truth; Redux stores normalized fetch state and response.

## Redux Product State (through T16)

```js
{
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
}
```

## Request Safety

- Product-list requests are deduplicated by deterministic query key.
- Product-detail requests are deduplicated by product id.
- Stale responses are ignored via request id checks in reducer.
- Empty successful list responses are treated as successful (`FETCHED`) and cached by query key.

## Build Performance

- Routed pages are lazy-loaded with `React.lazy`/`Suspense`.
- The production main JS chunk is below Vite's default warning threshold after route-level splitting.

## Product Model Boundary

Utilities centralize product mapping:

- `src/utils/productModel.js`
- `src/utils/slug.js`
- `src/utils/query.js`
- `src/utils/pagination.js`

Semantics preserved:

- `rating` is rating
- `sell_count` is sold count
- `stock` is stock
- `price` is current price

No fabricated discounts/reviews/variants are injected for API products.

## Signup and Authentication

- Public signup offers Customer and Store only; customer is selected from the `/roles` response by `code`. The backend rejects public Admin signup with `ROLE_NOT_ALLOWED_FOR_SIGNUP`.
- Accounts are usable immediately after signup. No activation email is sent.
- Store signup fields are normalized before payload creation:
  - Turkish mobile phone to leading-zero format.
  - Tax number to uppercase `TXXXXVXXXXXX`.
  - Turkish IBAN to uppercase compact format with checksum validation.
- Login and verify use raw-token `Authorization`; no `Bearer` prefix is added.
- Phase 4 backend auth accepts both the historical raw token and standard `Bearer <token>` Authorization forms during frontend migration.
- Production JWT signing requires the `JWT_SECRET` environment variable; there is no production secret fallback.
- JWTs are excluded from Redux user objects. Redux stores the user response fields with token fields removed.
- Logout clears local token storage, Axios authorization state, and Redux user state.

## API Coverage

- `GET /roles`
- `POST /signup` (invalid payload test)
- `POST /login`
- `GET /verify` (with token)
- `GET /categories`
- `GET /products`
- `GET /products?category=...`
- `GET /products?sort=...`
- `GET /products?filter=...`
- Combined query
- Pagination query (`limit`, `offset`)
- `GET /products/:productId`
- `POST /login` + `GET /verify` raw-token lifecycle
- `GET|POST|PUT /user/address`, `DELETE /user/address/:addressId`
- `GET|POST|PUT /user/card`, `DELETE /user/card/:cardId`
- `POST /order`
- `GET /order`

The collection was executed with Newman against an isolated local Spring/PostgreSQL backend, including authenticated address/card CRUD, one local order, order history, canonical price verification and temporary-record cleanup (Phase 10A snapshot: 32 requests, 35 assertions, no failures). The separate authenticated Production purchase/history E2E belongs to the historical Phase-9 release; it was not repeated on the final Phase-10 Production SHA.

The Spring Boot backend is under `server/`; backend deployment is on Render. Local frontend API requests default to `http://localhost:8080`, while Vercel Production uses the explicit Render API URL above.

Historical note: the original WorkinTech API returned HTTP 500 for an unknown product ID in an earlier observation. The Spring API returns 404, and the deployed frontend displays its product-not-found state.

## Postman

Collection: `postman/fsweb0825-ecommerce.postman_collection.json`

The collection defaults to `http://localhost:8080` and has a pre-request guard that skips requests unless the host is localhost. Supply synthetic values through a local Postman environment. Do not configure this write-capable collection for Production.

Variables included:

- `baseUrl`
- `token`
- `categoryId`
- `productId`
- `filter`
- `sort`
- `limit`
- `offset`

## Figma

Figma export found and available at:

- `src/figmas/figma-export/Ecommerce_UI_Kit_Full_Export`

## Cart and Order Architecture

- Cart is stored only in `shoppingCart.cart`, keyed by `product.id`; totals are derived by `src/utils/cart.js`.
- Product-detail links require real category metadata; the app does not fabricate canonical category slugs when categories are unavailable.
- Checkout uses saved addresses/cards from the authenticated API. CCV exists only in the transient payment form.
- Order totals are calculated by the backend from canonical product prices; order creation and inventory updates are transactional and use product-row locks.
- Saved-card compatibility retains and returns the full `card_no`. `fetchCreditCards` dispatches those records into Redux `client.creditCards`, so saved-card PAN can be present in that state. CVV/CCV remains transient and is not persisted or returned by saved-card APIs.
- This project is not PCI compliant. No masking or encryption-at-rest guarantee is claimed. Development Redux logging redacts sensitive fields; the Production Redux logger is disabled.

## Demo and Database Limitations

- Payment is simulated: there is no real payment gateway and no real card transaction takes place. Use synthetic payment details only; the saved-card compatibility described above is not production-grade payment handling.
- Render Free PostgreSQL 16 (`fsweb0825-ecommerce-db`) expires **2026-10-27 at 13:30:57 Europe/Istanbul** (10:30:57 UTC). Availability was verified by a read-only metadata check on 2026-10-17; it is not guaranteed through an evaluation date. Plan submission/evaluation within that lifetime.
- No independent Production backup has been verified. A new Free database requires separate provisioning; existing user/order data do not automatically transfer. Flyway can reconstruct schema and migration-provided seeds, not recover previous application records. Restoration or separate reseeding would be needed, with no guaranteed recovery of Production records.
- Render Free web-service cold starts have exceeded two minutes in observed checks (approximately 135-145 seconds). Before a demonstration, warm the existing API with a read-only GET to [`/health`](https://fsweb0825-ecommerce-api.onrender.com/health) and wait for `UP` before opening frontend routes. No automatic warm-up is configured by this documentation work.
- The October 16 Render update succeeded through a manual deployment after the expected automatic trigger did not initiate it. Auto-deploy remains enabled; its trigger issue was not root-caused or proven permanently fixed.
- Do not repeat the historical Phase-9 Production order or point the write-capable Newman collection at Production. Final academic acceptance must be checked against the actual assignment, including the implementation differences documented in [project-phases.md](project-phases.md).

Made by Emre Ciner

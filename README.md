# fsweb0825 E-Commerce Project

React + Vite e-commerce project for WorkinTech Bootcamp.

## Current Phase Status

- WorkinTech tasks T01-T23 are complete, including authenticated Postman/Newman execution against an isolated local Spring/PostgreSQL backend.
- Internal Phases 1-9 are complete. Phase 9 released the frontend checkout/cart repairs to Vercel Production and passed authenticated Production E2E.
- Frontend Production release: `53b10d82d6b921dea3b919a81f3895a875f860ca` on `main`.
- Backend deployment remains a separate baseline: Render deploys `feat/backend-api` at `ae4322a47a807c64d16c3126276ca607003a19fc`.
- Next: Phase 10A final hardening and documentation reconciliation is in progress; it must not create another Production order.

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

The frontend Production release SHA and Render backend deployment branch/SHA are intentionally separate: Vercel `main` is at `53b10d82d6b921dea3b919a81f3895a875f860ca`; Render currently deploys `feat/backend-api` at `ae4322a47a807c64d16c3126276ca607003a19fc`.

## Run

```bash
npm ci
npm run dev
npm run lint
npm test
npm run build
```

Supported runtime: Node.js 20.19+ with npm (Node 22 is used by CI). Frontend CI runs `npm ci`, lint, tests, and production build on push and pull request.

## Environment

For local development, create `.env` from `.env.example` and run the backend locally:

```env
VITE_API_URL=http://localhost:8080
```

Vercel Production explicitly sets `VITE_API_URL=https://fsweb0825-ecommerce-api.onrender.com`. Do not put secrets in frontend environment variables or `.env.example`.

## Local Backend and Verification

Requirements: Java 21, Maven Wrapper (included), and a local PostgreSQL 16 server. Create a local database named `ecommerce`; Flyway applies the schema on startup. The local profile defaults to PostgreSQL at `localhost:5432` with database `ecommerce` and user `postgres`; set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` to match your local installation. `JWT_SECRET` is required and must contain at least 32 bytes. Use a local-only value, never a Production secret.

From the repository root in PowerShell:

```powershell
$env:SPRING_PROFILES_ACTIVE = "local"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "ecommerce"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "your-local-postgres-password"
$env:JWT_SECRET = "local-only-change-me-32-char-secret"
.\server\mvnw.cmd -f server/pom.xml spring-boot:run
```

Check Java with the wrapper's `-version` option. Docker Engine must be running for the PostgreSQL/Testcontainers integration tests.

```powershell
.\server\mvnw.cmd -f server/pom.xml -version
.\server\mvnw.cmd -f server/pom.xml clean verify
```

Install and verify the frontend from the repository root:

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

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

- Signup uses API role semantics; customer is selected from the `/roles` response by `code`.
- Store signup fields are normalized before payload creation:
  - Turkish mobile phone to leading-zero format.
  - Tax number to uppercase `TXXXXVXXXXXX`.
  - Turkish IBAN to uppercase compact format with checksum validation.
- Login and verify use raw-token `Authorization`; no `Bearer` prefix is added.
- Phase 4 backend auth accepts both the historical raw token and standard `Bearer <token>` Authorization forms during frontend migration.
- Production JWT signing requires the `JWT_SECRET` environment variable; there is no production secret fallback.
- Tokens are kept out of Redux. Redux stores the user response fields with token fields removed.
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

The collection has been executed with Newman against an isolated local Spring/PostgreSQL backend, including authenticated address/card CRUD, one local order, order history, canonical price verification, and temporary-record cleanup. Production authenticated E2E was separately completed for the authorized single test order.

The Spring Boot backend is under `server/`; backend deployment is on Render. Local frontend development defaults to `http://localhost:8080`, while Vercel Production uses the explicit Render API URL above.

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
- Saved-card compatibility currently retains and returns the full `card_no`; CCV is not persisted or returned, and this capstone is not PCI compliant. Do not claim saved PAN masking at rest.

Made by Emre Ciner

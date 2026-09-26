# fsweb0825 E-Commerce Project

React + Vite e-commerce project for WorkinTech Bootcamp.

## Current Phase Status

- Frontend WorkinTech tasks T01-T23 are complete; the React/Vite frontend remains independently deployable and still uses the existing external API contract.
- Internal backend Phases 1-6 are complete. Phase 6 (`d4e9f63`) added transactional `POST /order` and owner-scoped `GET /order`.
- Current backend baseline: `d4e9f63f61da4386fa222bc79625ba5ee2330e4b` on `feat/backend-api` (local and remote matched at reconciliation).
- Next: Phase 7, backend integration coverage and CI, has not started. Phases 8-10 remain future work.

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

The backend in `server/` uses Java 21, Spring Boot, Spring Security/JWT, JPA/Hibernate, PostgreSQL, and Flyway. Its production deployment is planned for internal Phase 8.

## Run

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

Supported runtime: Node.js 20.19+ (Node 22 is used by CI). Frontend CI runs install, lint, tests, and production build on push and pull request.

## Environment

Create `.env` from `.env.example`:

```env
VITE_API_URL=https://workintech-fe-ecommerce.onrender.com
```

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

Catalog and authentication requests were previously verified against the public API. The authenticated address, card, and order requests are implemented and documented in Postman, but were not live-executed in this audit because no safe session token was available.

The Spring Boot backend is implemented through internal Phase 6 under `server/`. Frontend cutover to this backend through `VITE_API_URL` belongs to internal Phase 9; the frontend currently retains its existing external API configuration. Backend deployment belongs to Phase 8.

Observed backend behavior: `GET /products/99999999` returned HTTP 500 on 2026-07-21, so invalid product detail requests are treated as retryable failures rather than assumed 404s.

## Postman

Collection: `postman/fsweb0825-ecommerce.postman_collection.json`

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

Made by Emre Ciner

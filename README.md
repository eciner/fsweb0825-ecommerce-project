# fsweb0825 E-Commerce Project

React + Vite e-commerce project for WorkinTech Bootcamp.

## Current Phase Status

- Completed locally: T01-T23

## Stack

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

The current milestone is the frontend capstone. A separately developed Spring Boot backend can be connected later through `VITE_API_URL`; no backend implementation is included here.

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

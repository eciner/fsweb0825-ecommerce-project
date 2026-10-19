# 📚 WorkinTech Frontend Development Bootcamp — Capstone Project

**👨‍💻 Student:** [Emre Ciner](https://github.com/eciner) | **🚀 Live Demo:** [View on Vercel](https://fsweb0825-ecommerce-project.vercel.app/)

> **Implementation note — approved Spring application:** Original task descriptions, examples, ordering and checked/unchecked markers below are preserved as the assignment record. Notes using this label explain the shipped application at approved release `173a5786ca41dbef2c9ce0f557900a27d0464323`; they do not rewrite the original requirements or claim that every requirement was implemented literally. Check the noted differences against the actual academic rubric. Original sample users, dates and payment values are historical examples, not Production credentials or instructions to submit them. Current setup and release evidence are in [README.md](README.md).

---

## ⚙️ T01: Project Setup

- [x] Create github repo
- [x] Create React Project via [Vite](https://vitejs.dev/guide/)
- [x] Install all dependencies
  - [x] Redux & Redux Thunk
  - [x] React Router v5
  - [x] Tailwind
  - [x] Axios
  - [x] Toastify
  - [x] Icon Library - (https://lucide.dev/guide/packages/lucide-react)
- [x] Deploy your project to Vercel/Render/Netlify
  - ✅ Deployed to: https://fsweb0825-ecommerce-project.vercel.app/

> 💡 **Tip:** Check out this Youtube Playlist [Workintech E-Comm Projesi Doping](https://youtube.com/playlist?list=PL-w1xOwMMQ1PTMXidBINRj9diBko1X86U&feature=shared) for tips and tricks relevant to the project.

---

## 🏠 T02: Home Page

### 🎨 Design Resources

- **Figma:** [Figma-Ecommerce-UI-Kit-(Demo-Version)-(Community)](<https://www.figma.com/file/tXhNJv706AWM0lXlyxLH9l/E-commerce-UI---Figma-Ecommerce-UI-Kit-(Demo-Version)-(Community)>)

### 📋 Requirements

- ✅ Use only `Flex Layout`
- ✅ Use only `Tailwind` classes, **no custom classes allowed!**
  - 📖 [Customizing Theme and Arbitrary values](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values)
  - 📖 [@apply directive usage](https://tailwindcss.com/docs/reusing-styles#extracting-classes-with-apply)
  - 📖 [Tailwind responsive solution](https://tailwindcss.com/docs/responsive-design)

📱 **Tailwind is Mobile First by default.** If you want to convert to [Desktop first, follow this documentation](https://tailwindcss.com/docs/screens#max-width-breakpoints) ⚠️ **NOT RECOMMENDED**

> ✅ **Best Practice:** [Follow Mobile First approach](https://tailwindcss.com/docs/responsive-design#working-mobile-first)

### ✨ Implementation Checklist

- [x] Create Layout Components (layout pattern from [NextJS docs](https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts#layout-pattern))
  - [x] Header — single header/menu for all pages
  - [x] PageContent — container holding routed pages
  - [x] Footer
- [x] Create Home Page Component Mobile View (Mobile First approach)
- [x] Create Home Page Component Desktop View
- [x] Create repetitive Components like: **ProductCard**
- [x] Slider component
  - [x] Find a slider component usable in React
  - [x] Implement it on Home Page
- [x] Activate **React Router and Links** for Home Page
- [x] Use an external icon library [Lucide](https://lucide.dev/guide/packages/lucide-react) or download [Feather](https://feathericons.com)

<details>
<summary>📂 Expected Folder Structure</summary>

```
src/
   components/
       ProductCard.js
   layout/
       Header.js
       PageContent.js
       Footer.js
   pages/
       HomePage.js
       ...
```

</details>

---

## 🛍️ T03: Shop Page

> ⚠️ **NOTE:** There should be only ONE Header, Footer components for all pages, no color changes needed!

- [x] Create Shop Page Component Mobile View
- [x] Create Shop Page Component Desktop View
- [x] Activate **React Router and Links** for Shop Page
- [x] the url should be `/shop`

---

## 📦 T04: Product Detail Page

> ⚠️ **NOTE:** There should be only ONE Header, Footer components for all pages, no color changes needed!

- [x] Create Product Detail Page Component Mobile
- [x] Create Product Detail Page Component Desktop View
- [x] Activate **React Router and Links** for Product Detail Page (Product card click should navigate to Product Detail)

---

## 📧 T05: Contact Page

> ⚠️ **NOTE:** There should be only ONE Header, Footer components for all pages, no color changes needed!

- [x] Create Contact Page Component Mobile View
- [x] Create Contact Page Component Desktop View
- [x] Activate **React Router and Links** for Contact Page

---

## 👥 T06: Team Page

> **Dated enhancement decision - 2026-10-17:** The original T06 requirement below
> explicitly names Gökhan Özdemir as Project Manager. It remains preserved as an
> assignment requirement. The later approved enhancement independently supplies
> seven named contributors/roles and uses those seven in the current Team/About
> UI; it does not implement the original Project Manager item literally. Academic
> acceptance of this specification difference remains unverified.


> ⚠️ **NOTE:** There should be only ONE Header, Footer components for all pages, no color changes needed!

- [x] Create Team Page Component Mobile View
- [x] Create Team Page Component Desktop View
- [x] Activate **React Router and Links** for Team Page
  - [x] Add "Gökhan Özdemir" as Project Manager (You can use LinkedIn profile image)
  - [x] Add yourself as a Full Stack Developer
  - [x] Add your team members

---

## ℹ️ T07: About Us Page

> ⚠️ **NOTE:** There should be only ONE Header, Footer components for all pages, no color changes needed!

- [x] Create About Us Page Component Mobile View
- [x] Create About Us Page Component Desktop View
- [x] Activate **React Router and Links** for About Us Page

---

## 📝 T08: Sign Up User Form Page

> **Implementation note — approved Spring application:** The original WorkinTech API URL below is historical. Local requests use Spring Boot at `http://localhost:8080`; Vercel Production uses the explicit `VITE_API_URL=https://fsweb0825-ecommerce-api.onrender.com`.
>
> Public registration accepts Customer and Store only, selected by role code from `/roles`. The original Customer/Admin payload description does not authorize public Admin signup in this application: Admin is absent from the selector and the backend rejects it with `ROLE_NOT_ALLOWED_FOR_SIGNUP`.
>
> The original activation-email requirement is **not implemented as written**. The shipped app creates an immediately usable account, sends no activation email, and displays account-created/login guidance. The original requirement and its checkbox are retained below so this difference remains visible.

- [x] Create a [Postman collection](https://learning.postman.com/docs/getting-started/first-steps/creating-the-first-collection/) for the project. Add and extend the collection as you go in the project.
- [x] Test the API before implementing in the project.

- [x] A form should be created to sign up a new user
- [x] Page URL should be `/signup`
- [x] First you need to create and `Axios instance` with baseURL: [https://workintech-fe-ecommerce.onrender.com](https://workintech-fe-ecommerce.onrender.com)

- [x] You need to use `react-hook-form` library
  - [x] **Name**: `name` field is required with min 3 char validation
  - [x] **Email**: `email` needs to be validated
  - [x] **Password**: `password` needs to be min 8 character including numbers, lower case, upper case and special chars
  - [x] **Password Validation**: `password` needs to be matched to second pass input field
  - **Role**: `role_id` field should be listed in selection box and data needs to be fetched by GET request to endpoint: `/roles`
    - [x] **Customer** should be selected by default
    - [x] Selected role id should be assigned to `role_id` key in form data

  - If `store` option is selected as a role,
    - [x] **Store Name** `name` field should be appear at least 3 char
    - [x] **Store Phone** `phone` field should be valid Türkiye phone number
    - [x] **Store Tax ID** `tax_no` field should be appear and it should match the pattern "**T**XXXX**V**XXXXXX" ⇒ X can be any number
    - [x] **Store Bank Account** `bank_account` field should be valid IBAN address

- [x] on Submit it should create a POST request to endpoint `/signup` with form data
  - [x] **While submitting**, there should be a **spinner** in the Submit button and it should be disabled
  - [x] if submit is **successful,** it should redirect client to **previous page** with warning: "You need to click link in email to activate your account!"
  - [x] if submit is **not successful**, client should be informed about the error staying in the form page

- [x] Data Format
  - [x] Customer & Admin: `{ name, email, password, role_id }`
  - [x] Store: `{ name, email, password, role_id, store: { name, phone, tax_no, bank_account  } }`

**ERROR!**

- If you add an extra field, or change name of the field or there would be a missing field you can get an **ERROR** from backend.
- if you try to re-register with the same username and email you will be getting an **ERROR**.

---

## 🗄️ T09: Initialize Redux, Reducers with Action Creators

> NOTE: Redux toolkit RTK is not Redux. Be careful while researching. You will be using "Vanilla" Redux

**IF and ONLY IF you have an extensive Redux project, you may try using [ZuStand](https://github.com/pmndrs/zustand). You will be needing the map the rest of the requirements, from "Reduxy language" to "Zustand". You may not get support also from your instructors. This is an additional challenge if you dare.**

- [x] Install and initialize **Redux** with **Redux Thunk**, **Logger** middleware
  - you should install `redux`, `react-redux` and `redux-thunk`, `logger` middleware libraries
  - create and provide `store` object

- [x] Create Reducers with only **basic set actions**, reducers should have exact same structure below:
  - [x] Client Reducer:
    - user `{Object}` all about user
    - addressList: `{Object Array}` address list of the user
    - creditCards: `{Object Array}` credit card list of the user
    - roles: `{Object Array}`
    - theme: `{String}`
    - language: `{String}`
  - [x] Client Reducer Actions:
    - set user
    - set roles
    - set theme
    - set language

  - [x] Product Reducer:
    - categories: `{Object Array}`
    - product list: `{Object Array}`
    - total `{Number}` number of total products
    - limit: `{Number} | 25 by default` product count on the page
    - offset: `{Number} | 0 by default` for pagination
    - filter: `{String}`
    - fetch state: `{String} | "NOT_FETCHED" by default | one of "NOT_FETCHED" , "FETCHING", "FETCHED", "FAILED"`
  - [x] Product Reducer Actions:
    - set categories
    - set product list
    - set total
    - set fetch state
    - set limit
    - set offset
    - set filter

  - [x] ShoppingCart reducer
    - cart: `{Object Array}` will keep products are being bought

      ```js
        [
            {  count: 1, product: { id: "1235", … }  },
            {  count: 3, product: { id: "1236", … }  },
        ]
      ```

    - payment `{Object}` will keep payment information
    - address `{Object}` will keep address information

  - [x] ShoppingCart Reducer Actions
    - set cart
    - set payment
    - set address

- [x] Code `action creators` for those reducers and each field above
- [x] Create `thunk action creator` to get `roles` and put it in store. NOTE: It should be triggered only **in case of need!**

---

## 🔐 T10: Login Form

> **Implementation note — approved Spring application:** The sample public users below belong to the original WorkinTech task. They are not supplied login credentials for the deployed Spring database. Use only an appropriate existing account or synthetic local test data; no new Production account or order is authorized by this documentation.

- [x] Test the API via Postman.
- [x] Create Login Form using `react-hook-form` library
  - [x] it should have **Email & Password** fields (only email **validation)**
  - [x] on **Submit** it should create a `POST` request to `/login` endpoint by a `thunk action`
  - [x] if successfully logged in, user info should be saved on `client reducer => user`
    - [x] user should be redirected to previous page. If there is no previous page then home page.
    - [x] user info should be seen on layout header
    - [x] use [gravatar](https://gravatar.com/) image to fetch user picture by email! You may use a library like [react-gravatar](https://kyleamathews.github.io/react-gravatar/) if you want extra challenge, you may follow Gravatar developer docs, use hashing and get the image.
    - [x] save token to `localStorage` if remember me is checked!
  - [x] if log in is failed, show error message by `toaster` and keep user in login page

**NOTE!** You can use **public users** below ( Password: `123456` )

- `customer@commerce.com`
- `store@commerce.com`
- `admin@commerce.com`

---

## 🔄 T11: Auto login by token from localStorage

- [x] Test the API via Postman.
- [x] As a client;
  - [x] after closing, if I open app again there will be token info in localStorage only if "Remember Me" is checked
  - [x] if there is a token, on app load first should make a get request to verify
  - [x] if token authorized, backend will response user information and client will be logged in automatically

- [x] on app start it should check if there is token in localStorage
  - [x] if there is
    - [x] put token to axios authorization header
          `{ Authorization: token }`

    **NOT: Do not add `Bearer` prefix to token**
    - [x] make a `GET` request to `/verify` endpoint
    - [x] if token is authorized, you will get User object
      - [x] put User object to reducer
      - [x] renew token in `localStorage` & `axios` header

  - [x] if token is not authorized,
    - [x] delete token from `localStorage`
    - [x] delete token from `axios` header

---

## 📂 T12: Fetch Categories

- [x] Test the API via Postman.
- [x] Fetch categories by **thunk action** and store it in the `gobal reducer`
- [x] endpoint `/categories`
- [x] list categories on the screen
- [x] categories should be link
- [x] on click it should navigate to `shop/:gender/:categoryName/:categoryId`
      samples:
      `shop/kadin/ayakkabi/2`
      `shop/erkek/gomlek/11`
- [x] top 5 categories should be listed on the screen with images regarding `rating` value
- [x] all categories should be listed in drop down menu on header
- [x] Drop down menu uses grouped gender columns and category links as shown below:

![Image](https://github.com/user-attachments/assets/d9636df8-396a-4847-9966-7d5c0fe2e35a)

---

## 🛒 T13: Fetch Products

- [x] Test the API via Postman.
- [x] **Fetch products**
  - [x] by **thunk action** and save it in the `product reducer`
  - [x] endpoint `/products`
  - [x] in response you will get Object like below:

  ```js
  {
     total: 185,
     products: [
        { ProductObject1 },
        { ProductObject2 },
        …
     ]
  }
  ```

  After getting response you need to
  - [x] set total to Product Reducer
  - [x] set products to Product Reducer

- [x] You should list products in the UI (shopping page)

- [x] While fetching products data, a loading spinner should be shown on the screen

---

## 🧩 T14: Fetch Products Query Parameters

- [x] Test the API via Postman.
- [x] While fetching products, specify product list by using query parameters.

- [x] `category`: you can limit products by sending category
  - [x] if client selects a category it should navigate to `shop/:gender/:categoryName/:categoryId`
        sample: `shop/kadin/tisort/2`
  - [x] on shop page it should get `categoryId` from URL parameters
  - [x] on `categoryId` state change it should create a GET request to `products?category=2`

- [x] `sort`: products can be sorted by the select component on shop page
  - [x] select component lists values of `"price:asc", "price:desc", "rating:asc", "rating:desc"`
  - [x] if client selects a sort option and clicks filter the value is held on committed `sort` query state
  - [x] on `sort` state change it creates a GET request to `products?sort=price:desc`

- [x] `filter`: on Shop page products can be filtered by an input beside sort select component
  - [x] if client types in filter input it is held as draft filter input
  - [x] on committed `filter` state change it creates a GET request to `products?filter={CLIENT_INPUT}`

### Remarkable Points

- [x] If one of the parameters `category`, `filter`, `sort` is changed, a new GET request is sent and products are reloaded.
- [x] If one of the parameters `category`, `filter`, `sort` is changed, other parameters are kept.

**Sample Case**

- [x] first category selected creates `products?category=2`
- [x] then filter text entered as `siyah` creates `products?category=2&filter=siyah`
- [x] then sort selected as `price:desc` creates `products?category=2&filter=siyah&sort=price:desc`

---

## 📄 T15: Products Pagination | Infinite Scrolling

- [x] Test the API via Postman.
- [x] Used **pagination** implementation.
- [x] Query parameters:
  - [x] `limit`: by default `25`; specifies product count fetched at once.
  - [x] `offset`: by default `0`; specifies product count to skip.

Sample Case:

- [x] page 1: `products?limit=25&offset=0`
- [x] page 2: `products?limit=25&offset=25`
- [x] page 3: `products?limit=25&offset=50`

- [x] By using these two parameters, created numbered pagination.
- [ ] Optional library example: [React Pagination](https://www.npmjs.com/package/react-paginate)

---

## 📦 T16: Product Detail Page Implementation

- [x] Test the API via Postman.
- [x] When a product is clicked it navigates to Product Detail Page with proper URL
  - [x] URL is: `shop/:gender/:categoryName/:categoryId/:productNameSlug/:productId`
  - [x] Product Card uses `pointer` cursor and visible focus/hover affordance
  - [x] Product Detail Page is filled with real product data

- [x] **Fetch product**
  - [x] by **thunk action** and save it in the `product reducer`
  - [x] endpoint `/products/:productId`
  - [x] in response an object shape like below is returned:

  ```js
  {
    "id": 322,
    "name": "Gri Regular Astar",
    "description": "Gri Regular Astar Detayli Dokuma Blazer Ceket TWOAW20CE0316",
    "price": 461.99,
    "stock": 140,
    "store_id": 1,
    "category_id": 3,
    "rating": 3.64,
    "sell_count": 281,
    "images": [
      {
        "url": "https://cdn.dsmcdn.com/ty181/product/media/images/20210923/14/135755138/57457659/1/1_org_zoom.jpg",
        "index": 0
      }
    ]
  }
  ```

- [x] While fetching product data, a loading spinner is shown on the screen.
- [x] After getting response:
  - [x] set product to Product Reducer
  - [x] show product details in UI (Product Detail page)
- [x] Product Detail Page has back button.

---

## 🛒 T17: Add Product to Shopping Cart

- [x] When a product is added to shopping cart, it should be added to reducer.
- [x] If same product is added more than once, product count should be increased in shopping cart.

ShoppingCart reducer:

```js
cart: [
  { count: 1, checked: true, product: { id: "1235", ... } },
  { count: 3, checked: true, product: { id: "1236", ... } },
];
```

- [x] All items in the cart should be visible on dropdown.

---

## 🧾 T18: Shopping Cart Page

- [x] On this page, client can see all items in the shopping cart as a data table view.
- [x] Product count can be decreased or increased.
- [x] Product can be removed from the list.
- [x] Product can be selected or deselected to create order.
- [x] Regarding selections, a total payment amount should be listed at the end of list.

NOTE: Order Summary and Create Order will be done on next tasks.

- [x] ShoppingCart reducer data:

```js
cart: [
  { count: 1, checked: true, product: { id: "1235", ... } },
  { count: 3, checked: true, product: { id: "1236", ... } },
];
```

---

## 📦 T19: Order Summary Box

- [x] Order Summary box should be added to right side of the list.
- [x] There should be products total price + shipping payment price - discount and grand total price.
- [x] There should be "Create Order" button but no functionality yet.

---

## 🏠 T20: Create Order Page > Step 1 Address

> **Implementation note — approved Spring application:** The form combines neighborhood and street/building/door details in the `Neighborhood / Address Details` textarea and sends them as `neighborhood`. There is no separate mandatory `address` DTO property. The address contract is `id` (response/update), `title`, `name`, `surname`, `phone`, `city`, `district`, `neighborhood`; the backend derives ownership from the authenticated principal. GET/POST/PUT use `/user/address`; DELETE uses `/user/address/:addressId`. The original separate-field wording and examples remain below.

### Description

- [x] There will be **two steps** on Create Order Page.
- [x] If user is not logged in, client should be **redirected to Login Page** (protected routing on React Router v5).
- [x] To use backend API successfully, add `token` to request headers.
- [x] In this task handle address information of client.

**Get address information**

- [x] On that page client can add shipping and receipt addresses separately.
- [x] Client can select previously saved address.
- [x] Make a GET request to `/user/address` to get saved address list of the user.

**Add new address**

- [x] If client clicks "Add Address" button, a form should be shown on the page.
- [x] Form fields:
  - [x] **Address Title**: String
  - [x] **Name** and **Surname**: String
  - [x] **Phone**: String
  - [x] **City**: selected from dropdown list
  - [x] **District**: String
  - [x] **Neighborhood**: String
  - [x] **Address**: multiline text for street/building/door details

```js
{
  "title": "ev adresi",
  "name": "Ali",
  "surname": "Karababa",
  "phone": "05376845834",
  "city": "istanbul",
  "district": "esenler",
  "neighborhood": "adres detaylari"
}
```

- [x] On submit, create POST request to `/user/address`.

**Update address**

- [x] Create PUT request to `/user/address` with payload:

```js
{
  "id": 1204,
  "title": "ev adresi",
  "name": "Ali",
  "surname": "Karababa",
  "phone": "05376845834",
  "city": "istanbul",
  "district": "esenler",
  "neighborhood": "adres detaylari"
}
```

**Delete address**

- [x] Create DELETE request to `/user/address/:addressId`.

---

## 💳 T21: Create Order Page > Step 2 Credit Card

> **Historical Phase-10 implementation note — approved Spring application:** GET/POST/PUT use `/user/card`; DELETE uses `/user/card/:cardId`. Saved-card responses contain `id`, `card_no`, `expire_month`, `expire_year`, `name_on_card` and can populate Redux `client.creditCards`. Full `card_no` is retained/returned for capstone compatibility; CVV/CCV stays transient and is not persisted. Current-month expiry is valid; past months are expired, so original sample dates are not current validation inputs. Payment is simulated, with no real gateway or charge; the project is not PCI compliant and makes no PAN masking/encryption-at-rest claim.

- [x] Payment methods will be implemented in this task.
- [x] There will be **add new card** option.
- [x] Saved cards will be listed.
- [x] There will be **payment options** fetched by card data.
- [x] POST request to create: `/user/card`
- [x] GET request to list: `/user/card`

- [x] To get saved card data create GET request to `/user/card`.
- [x] To save card data create POST request to `/user/card` with payload:

```js
{
  "card_no": "1234123412341234",
  "expire_month": 12,
  "expire_year": 2025,
  "name_on_card": "Ali Bas"
}
```

**Update card**

- [x] Create PUT request to `/user/card` with payload:

```js
{
  "id": "1",
  "card_no": "1234123412341234",
  "expire_month": 1,
  "expire_year": 2030,
  "name_on_card": "Ahmet Tas"
}
```

**Delete card**

- [x] Create DELETE request to `/user/card/:cardId`.

---

## ✅ T22: Complete Order

> **Historical Phase-10 implementation note — approved Spring application:** The frontend preserves the compatibility payload below. The backend binds `address_id`, `order_date`, `price` and `products` (`product_id`, positive `count`, optional `detail`); it derives the user from authentication, validates address ownership and uses canonical database prices instead of trusting client `price`. The shipped frontend sends a UTC ISO order date; the backend uses `Instant`. Compatibility card fields do not create a payment transaction and are not persisted in order history. Order/line persistence and stock/sell_count changes are transactional.
>
> Phase-10A Newman coverage (32 requests/35 assertions across the collection) used isolated local Spring/PostgreSQL data. The separate authenticated Production purchase/history E2E belongs to Phase 9 at `53b10d82d6b921dea3b919a81f3895a875f860ca`, with exactly one authorized persistent order; never repeat it. Phase 10K acceptance on `173a5786ca41dbef2c9ce0f557900a27d0464323` was read-only and did not retest authenticated checkout.

- [x] Test the API via Postman/Newman against an isolated local Spring/PostgreSQL backend. Production browser E2E was verified separately.
- [x] Create order by sending a POST request to `/order` endpoint.
- [x] Payload data should have structure like below:

```js
{
  "address_id": 1,
  "order_date": "2024-01-10T14:18:30",
  "card_no": 1234123412341234,
  "card_name": "Ali Bas",
  "card_expire_month": 12,
  "card_expire_year": 2025,
  "card_ccv": 321,
  "price": 1919,
  "products": [
    {
      "product_id": 12,
      "count": 1,
      "detail": "acik mavi - xl"
    },
    {
      "product_id": 13,
      "count": 2,
      "detail": "siyah - lg"
    }
  ]
}
```

- [x] After successful order creation, client should be congratulated.
- [x] Screen and current items in shopping cart should be reset.

---

## 🧾 T23: Previous Orders Page

> **Historical Phase-10 implementation note — approved Spring application:** `/orders` is the protected frontend page; the owner-scoped API is GET `/order`. Its response contains `id`, `order_date`, `price` and `products`; lines contain `product_id`, `count` and persisted `detail`. Order history contains no full PAN or CVV/CCV. Local Newman and historical Phase-9 Production E2E verified history separately. Final-SHA CI provides isolated integration coverage; Phase 10K did not freshly exercise authenticated Production history.

- [x] Test the API via Postman/Newman against an isolated local Spring/PostgreSQL backend. Production browser E2E was verified separately.
- [x] Create a new page component for previous orders of client.
- [x] It should be a protected route.
- [x] The link can be reached in a dropdown menu near user name in Header component.
- [x] Create a GET request to `/order` endpoint to get previous orders.
- [x] Create proper data table view for orders and order details.
- [x] You can use collapsable panels for order details.


## Current local enhancement annotation - 2026-10-17

Original T01-T23 descriptions, examples and checkboxes above are preserved as the
assignment/history record. The later enhancement/remediation changes current UI
behavior: Home uses the API; search and owned favorites are active; T20 adds 81
province names with partial dependent suggestions/manual fallback and optional
same/separate receipt selection; T21 uses masked summary reads and optional unchanged
PAN edits; T22 sends no PAN/CCV from the updated client and optionally identifies
its typed order intent with a customer-scoped request_id UUID (V12). Legacy payloads
remain accepted; no payment charge is introduced. T23 shows stored price/name/address
snapshots, with missing historical fields disclosed. V8-V11 remain immutable.

The original PAN payload examples and historical implementation notes do not describe
new client storage guarantees. Legacy full-PAN storage/API responses remain a
commercial-payment blocker. The seven-person team decision is separate from T06.
No nationwide district/neighborhood completeness, product photography rights or
institutional approval of assignment differences is asserted.

Current observed verification is in [PROJECT_DETAILS.md](PROJECT_DETAILS.md).
No historical release result is reused as current verification. Cross-platform
release requires [the release gates](PROJECT_DETAILS.md#deployment-evolution-and-release-gates); publication
and production writes are not part of this task.


## Current local release-review annotation ? 2026-10-20

The original task wording above remains unchanged. The current schema is V1-V13.
E01-E07 add bounded same-browser carts, collection-independent global search,
server-side price/stock filters, searchable provinces and verified audited shipment
management. Customer shipment JSON omits internal actor ids; authorized management
retains audit. Latest setup, requirement classifications, fresh verification and
local-versus-deployed distinctions are in [PROJECT_DETAILS.md](PROJECT_DETAILS.md).
T06 seven-person Team, T08 immediate activation and T22 no-PAN/CVV payload remain
approved deviations. Grid/custom CSS also means literal Flex/Tailwind-only styling
is not claimed. Shipping/discount remain zero-valued demo rows. Public Admin signup,
real payment capture, email activation and carrier integration are absent. Legacy
full-PAN compatibility remains a commercial blocker. No institutional acceptance
or new Production release is asserted by these annotations.

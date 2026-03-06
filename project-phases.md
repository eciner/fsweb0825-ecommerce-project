# 📚 WorkinTech Frontend Development Bootcamp — Capstone Project

**👨‍💻 Student:** [Emre Ciner](https://github.com/eciner) | **🚀 Live Demo:** [View on Vercel](https://fsweb0825-ecommerce-project.vercel.app/)

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

- [ ] Create a [Postman collection](https://learning.postman.com/docs/getting-started/first-steps/creating-the-first-collection/) for the project. Add and extend the collection as you go in the project.
- [ ] Test the API before implementing in the project.

- [ ] A form should be created to sign up a new user
- [ ] Page URL should be `/signup`
- [ ] First you need to create and `Axios instance` with baseURL: [https://workintech-fe-ecommerce.onrender.com](https://workintech-fe-ecommerce.onrender.com)

- [ ] You need to use `react-hook-form` library
    - [ ] **Name**: `name` field is required with min 3 char validation
    - [ ] **Email**: `email` needs to be validated
    - [ ] **Password**: `password` needs to be min 8 character including numbers, lower case, upper case and special chars
    - [ ] **Password Validation**: `password` needs to be matched to second pass input field
    
    - **Role**: `role_id` field should be listed in selection box and data needs to be fetched by GET request to endpoint: `/roles`
        - [ ] **Customer** should be selected by default
        - [ ] Selected role id should be assigned to `role_id` key in form data

    - If `store` option is selected as a role,
        - [ ] **Store Name** `name` field should be appear at least 3 char
        - [ ] **Store Phone** `phone` field should be valid Türkiye phone number
        - [ ] **Store Tax ID** `tax_no` field should be appear and it should match the pattern "**T**XXXX**V**XXXXXX" ⇒ X can be any number
        - [ ] **Store Bank Account** `bank_account` field should be valid IBAN address

- [ ] on Submit it should create a POST request to endpoint `/signup` with form data
    - [ ] **While submitting**, there should be a **spinner** in the Submit button and it should be disabled
    - [ ] if submit is **successful,** it should redirect client to **previous page** with warning: "You need to click link in email to activate your account!"
    - [ ] if submit is **not successful**, client should be informed about the error staying in the form page

- [ ] Data Format
    - [ ] Customer & Admin: `{ name, email, password, role_id }`
    - [ ] Store: `{ name, email, password, role_id, store: { name, phone, tax_no, bank_account  } }`
     
**ERROR!**
- If you add an extra field, or change name of the field or there would be a missing field you can get an **ERROR** from backend.
- if you try to re-register with the same username and email you will be getting an **ERROR**. 

---

## 🗄️ T09: Initialize Redux, Reducers with Action Creators

> NOTE: Redux toolkit RTK is not Redux. Be careful while researching. You will be using "Vanilla" Redux

**IF and ONLY IF you have an extensive Redux project, you may try using [ZuStand](https://github.com/pmndrs/zustand). You will be needing the map the rest of the requirements, from "Reduxy language" to "Zustand". You may not get support also from your instructors. This is an additional challenge if you dare.** 

- [ ] Install and initialize **Redux** with **Redux Thunk**, **Logger** middleware
    - you should install `redux`, `react-redux` and `redux-thunk`, `logger` middleware libraries
    - create and provide `store` object

- [ ] Create Reducers with only **basic set actions**, reducers should have exact same structure below:

    - [ ] Client Reducer: 
        - user `{Object}` all about user
        - addressList: `{Object Array}` address list of the user
        - creditCards: `{Object Array}` credit card list of the user
        - roles: `{Object Array}`
        - theme: `{String}`
        - language: `{String}`
    - [ ] Client Reducer Actions: 
        - set user
        - set roles
        - set theme
        - set language

    - [ ] Product Reducer:
        - categories: `{Object Array}`
        - product list: `{Object Array}`
        - total `{Number}` number of total products
        - limit: `{Number} | 25 by default` product count on the page
        - offset: `{Number} | 0 by default` for pagination
        - filter: `{String}`
        - fetch state: `{String} | "NOT_FETCHED" by default | one of "NOT_FETCHED" , "FETCHING", "FETCHED", "FAILED"`
    - [ ] Product Reducer Actions:
        - set categories 
        - set product list
        - set total
        - set fetch state
        - set limit
        - set offset
        - set filter

    - [ ] ShoppingCart reducer
        - cart: `{Object Array}` will keep products are being bought 
   
          ```js
            [
                {  count: 1, product: { id: "1235", … }  },
                {  count: 3, product: { id: "1236", … }  },
            ]
            ```
        
        - payment `{Object}` will keep payment information
        - address `{Object}` will keep address information
    - [ ] ShoppingCart Reducer Actions
        - set cart
        - set payment
        - set address

- [ ] Code `action creators` for those reducers and each field above
- [ ] Create `thunk action creator` to get `roles` and put it in store. NOTE: It should be triggered only **in case of need!**

---

## 🔐 T10: Login Form

- [ ] Test the API via Postman.
- [ ] Create Login Form using `react-hook-form` library
    - [ ] it should have **Email & Password** fields (only email **validation)**
    - [ ] on **Submit** it should create a `POST` request to `/login` endpoint by a `thunk action`
    - [ ] if successfully logged in, user info should be saved on `client reducer => user`
        - [ ] user should be redirected to previous page. If there is no previous page then home page.
        - [ ] user info should be seen on layout header
        - [ ] use [gravatar](https://gravatar.com/) image to fetch user picture by email! You may use a library like [react-gravatar](https://kyleamathews.github.io/react-gravatar/) if you want extra challenge, you may follow Gravatar developer docs, use hashing and get the image. 
        - [ ] save token to `localStorage` if remember me is checked!
    - [ ] if log in is failed, show error message by `toaster` and keep user in login page

**NOTE!** You can use **public users** below ( Password: `123456` )
- `customer@commerce.com`
- `store@commerce.com`
- `admin@commerce.com`

---

## 🔄 T11: Auto login by token from localStorage

- [ ] Test the API via Postman.
- [ ] As a client;
    - [ ] I need to be signed up and logged in to purchase something and other purchase processes .
    - [ ] after closing, if I open app again there will be token info in localStorage only if "Remember Me" is checked
    - [ ] if there is a token, on app load first should make a get request to verify
    - [ ] if token authorized, backend will response user information and client will be logged in automatically

- [ ] on app start it should check if there is token in localStorage
    - [ ] if there is
        - [ ] put token to axios authorization header
        ` { Authorization: token } `

        **NOT: Do not add `Bearer` prefix to token**
        - [ ] make a `GET` request to `/verify` endpoint
        - [ ] if token is authorized, you will get User object
            - [ ] put User object to reducer
            - [ ] renew token in `localStorage` & `axios` header

    - [ ] if token is not authorized,
        - [ ] delete token from `localStorage`
        - [ ] delete token from `axios` header

---

## 📂 T12: Fetch Categories

- [ ] Test the API via Postman.
- [ ] Fetch categories by **thunk action** and store it in the `gobal reducer`
- [ ] endpoint `/categories`
- [ ] list categories on the screen
- [ ] categories should be link
- [ ] on click it should navigate to `shop/:gender/:categoryName/:categoryId`   
samples: 
`shop/kadin/ayakkabi/2`
`shop/erkek/gomlek/11`
- [ ] top 5 categories should be listed on the screen with images regarding `rating` value
- [ ] all categories should be listed in drop down menu on header
- [ ] Drop down menu should be in the same format as below:

![Image](https://github.com/user-attachments/assets/d9636df8-396a-4847-9966-7d5c0fe2e35a)

---

## 🛒 T13: Fetch Products

- [ ] Test the API via Postman.
- [ ] **Fetch products**
    - [ ] by **thunk action** and save it in the `product reducer`
    - [ ] endpoint `/products`
    - [ ] in response you will get Object like below:

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
    - [ ] set total to Product Reducer
    - [ ] set products to Product Reducer

- [ ] You should list products in the UI (shopping page)

- [ ] While fetching products data, a loading spinner should be shown on the screen

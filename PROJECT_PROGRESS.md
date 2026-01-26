# Project Progress

## T01: Project Setup ✅ + Some T02 features

Built the app with Vite + React 18 and wired up the essentials.

**Installed stack:**

- Redux + Redux Thunk (state management)
- React Router v5 (navigation)
- Tailwind CSS (styling - utilities only)
- Axios (API calls)
- React Toastify (notifications)
- Lucide React (icons)
- Swiper (sliders/carousels)

**Project structure:**

```
src/
  components/
    ProductCard.jsx
  layout/
    Header.jsx
    PageContent.jsx
    Footer.jsx
  pages/
    HomePage.jsx
  services/
    api.js (Axios config)
  store/
    store.js (Redux setup)
```

**Configured & enforced:**

- Redux store ready to use
- Axios interceptors for auth/errors
- Tailwind utilities only (no custom CSS)
- Flex-based layouts everywhere (mobile-first)
- Arbitrary values enabled (e.g., `w-[calc(50%-12px)]`)
- React Router working
- All providers wrapped in `src/main.jsx`

**Deploy (Vercel):**

- `vercel.json` configured ✅
- Deployed to production: https://fsweb0825-ecommerce-project.vercel.app/ ✅

**Design constraints:**

- ✅ Flex layout only (no grid)
- ✅ Tailwind utilities only (no custom classes)
- ✅ Mobile-first responsive design
- ✅ All files use `.jsx` extension for JSX content

**- Build tested and passing ✅**

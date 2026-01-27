<div align="center">

# 🛍️ E-Commerce Project

### A modern Vite-powered React e-commerce app with mobile-first layouts, Swiper-driven hero sliders, and Tailwind-only styling.

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://fsweb0825-ecommerce-project.vercel.app/)
[![React](https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-⚡-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**Capstone Project:** WorkinTech Frontend Development Bootcamp  
**Built by:** [Emre Ciner](https://github.com/eciner)

</div>

---

## 📊 Status

| Phase  | Task            | Status                                                          |
| ------ | --------------- | --------------------------------------------------------------- |
| T01    | Setup           | ✅                                                              |
| T02    | Home            | ✅                                                              |
| Build  | `npm run dev`   | ✅                                                              |
| Build  | `npm run build` | ✅                                                              |
| Deploy | Live            | [🌐 View Site](https://fsweb0825-ecommerce-project.vercel.app/) |

---

## 🚀 Tech Stack

| Technology                     | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| **React (Vite, current 19.x)** | UI library                                               |
| **Tailwind CSS**               | Utility-first styling (flex-only layouts; no custom CSS) |
| **React Router v5**            | Client-side routing                                      |
| **Redux + Redux Thunk**        | State management                                         |
| **Swiper**                     | Carousel/slider library                                  |
| **Lucide React**               | Icon library                                             |
| **Axios**                      | HTTP client                                              |
| **React Toastify**             | Notifications                                            |

---

## 🎯 Getting Started

### 📋 Prerequisites

- Node.js 16+
- npm or yarn

### 📦 Installation

```bash
npm install
```

### 💻 Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 🏗️ Build

```bash
npm run build
```

### 🔍 Lint

```bash
npm run lint
```

---

## ✅ Constraints (met)

- **T01:** Vite + React; Redux + Redux Thunk; React Router v5; Tailwind installed/used; Axios; React Toastify; Lucide icons; Swiper; dev/build commands clean; deployable to Vercel.
- **T02:** Flex-only layouts (no CSS Grid); Tailwind-only styling (no custom classes); mobile-first; arbitrary Tailwind values when needed; single global Header/PageContent/Footer; Home route active with links; Swiper slider implemented on Home; reusable components (e.g., ProductCard).

---

## 📁 Project Structure

```
src/
  assets/          # 🖼️  Images, banners, product photos
  components/      # 🧩 Reusable UI components (cards, sliders, banners)
  layout/          # 🏗️  Global layout components (Header, PageContent, Footer)
  pages/           # 📄 Page components (HomePage, NotFound)
  store/           # 🗄️  Redux store, reducer, actions
  App.jsx          # 🎯 Root app component
  main.jsx         # 🚀 Entry point
  index.css        # 🎨 Global Tailwind styles
```

---

## 🏛️ Architecture

### 🎯 Layout Pattern

- **App.jsx**: Global shell with Header, PageContent (routing), Footer
- **PageContent.jsx**: Router container with route definitions
- **Pages**: Route-level components (HomePage, NotFound)
- **Components**: Reusable UI blocks

### 🎨 Styling

- Tailwind CSS only (flexbox-based layouts; mobile-first)
- No CSS Grid, CSS Modules, or custom CSS files
- Responsive design with Tailwind breakpoints

### 🗄️ State Management

- Redux for global state
- Redux Thunk for async operations
- Local component state for UI interactions

---

## ✨ Features

- 🎠 Hero sliders with auto-play (Swiper)
- 📝 Editor's pick categories
- 🛍️ Product grid with lazy-loaded images
- 📰 Featured posts section
- 📱 Responsive navigation header (Lucide icons)
- 🎪 Product carousel with custom controls
- 🚫 404 page for unmapped routes

---

## 🌐 Browser Support

| Browser | Version |
| ------- | ------- |
| Chrome  | latest  |
| Firefox | latest  |
| Safari  | latest  |
| Edge    | latest  |

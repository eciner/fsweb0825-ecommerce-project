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

- [ ] Create Shop Page Component Mobile View
- [ ] Create Shop Page Component Desktop View
- [ ] Activate **React Router and Links** for Shop Page
- [ ] the url should be `/shop`

---

## 📦 T04: Product Detail Page

> ⚠️ **NOTE:** There should be only ONE Header, Footer components for all pages, no color changes needed!

- [ ] Create Product Detail Page Component Mobile
- [ ] Create Product Detail Page Component Desktop View
- [ ] Activate **React Router and Links** for Product Detail Page (Product card click should navigate to Product Detail)

---

## 📧 T05: Contact Page

> ⚠️ **NOTE:** There should be only ONE Header, Footer components for all pages, no color changes needed!

- [ ] Create Contact Page Component Mobile View
- [ ] Create Contact Page Component Desktop View
- [ ] Activate **React Router and Links** for Contact Page

---

## 👥 T06: Team Page

> ⚠️ **NOTE:** There should be only ONE Header, Footer components for all pages, no color changes needed!

- [ ] Create Team Page Component Mobile View
- [ ] Create Team Page Component Desktop View
- [ ] Activate **React Router and Links** for Team Page
  - [ ] Add "Gökhan Özdemir" as Project Manager (You can use LinkedIn profile image)
  - [ ] Add yourself as a Full Stack Developer
  - [ ] Add your team members

---

## ℹ️ T07: About Us Page

> ⚠️ **NOTE:** There should be only ONE Header, Footer components for all pages, no color changes needed!

- [ ] Create About Us Page Component Mobile View
- [ ] Create About Us Page Component Desktop View
- [ ] Activate **React Router and Links** for About Us Page

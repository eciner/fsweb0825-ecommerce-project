export const informationPages = {
  careers: {
    title: "Careers at WiT",
    eyebrow: "PROJECT INFORMATION",
    intro:
      "This is a WorkinTech learning project. We are not advertising employment or collecting job applications.",
    sections: [
      {
        title: "Open positions",
        id: "open-positions",
        text: "There are no verified vacancies. The team page describes project contributions rather than open jobs.",
      },
      {
        title: "Learn about the work",
        text: "Explore how design, frontend, backend and database responsibilities combine in this capstone. Contact is available for project questions; do not submit a CV or other sensitive information.",
      },
    ],
  },
  privacy: {
    title: "Sample privacy notice",
    eyebrow: "DEMO TEXT — NOT LEGAL ADVICE",
    intro:
      "This sample describes observed project behavior. It is not an approved production privacy policy or a claim of GDPR/KVKK compliance.",
    sections: [
      {
        title: "Account and shopping data",
        text: "The API stores account details, saved addresses, favorites and demo orders. Address and order access is scoped to the signed-in account. A remembered session token is stored in browser localStorage when Remember Me is selected. The same-browser cart stores product IDs, quantities, selection flags and opaque line identifiers in localStorage. Account carts are separated; a guest cart merges once on sign-in. Prices and availability are reloaded from the API. Minimal pending-purchase reservations identify only original cart lines; no payment data or credentials enter cart storage. A pending demo order stores its request reference, account email and item/address identifiers in tab-scoped sessionStorage for retry recovery; no PAN, CCV, password or JWT is added to that recovery record.",
      },
      {
        title: "Payment and contact limitations",
        text: "Use synthetic information only. Legacy saved-card APIs retain full card numbers for capstone compatibility; the updated storefront requests masked summaries. CCV is transient. Contact stores the submitted name, email, subject and message; no email delivery is configured and no automatic retention cleanup is implemented.",
      },
      {
        title: "External requests and requests for help",
        text: "Some existing editorial images and account avatars are requested from third-party hosts, including Gravatar. Network providers receive ordinary request metadata. This demo does not provide a self-service data-export or account-deletion workflow. Contact can receive project questions; no statutory rights-processing service is promised here.",
      },
    ],
  },
  terms: {
    title: "Sample terms of service",
    eyebrow: "DEMO TEXT — NOT LEGAL ADVICE",
    intro:
      "These illustrative terms explain the capstone boundaries. They are not reviewed commercial terms or a substitute for legal advice.",
    sections: [
      {
        title: "Demonstration use",
        text: "The catalog and checkout demonstrate application behavior. Placing a demo order records data and updates demo inventory; it does not buy goods, charge a card or arrange delivery.",
      },
      {
        title: "Accounts and availability",
        text: "Use synthetic data and protect your session credentials. Customer and Store registration are supported; public Admin signup is forbidden. Store and Admin accounts have scoped shipment management; a complete seller dashboard is not implemented. Hosting and demo data may become unavailable.",
      },
      {
        title: "Before any commercial use",
        text: "Real payment processing, fulfillment, verified business policies and operational support would require separate implementation and review. No commercial service-level commitment is made.",
      },
    ],
  },
  cookies: {
    title: "Sample cookie and storage notice",
    eyebrow: "DEMO TEXT — NOT LEGAL ADVICE",
    intro:
      "This describes application storage visible in the source. It is not a cookie-consent platform or a compliance certification.",
    sections: [
      {
        title: "Remembered sign-in",
        text: "Remember Me stores a session token in localStorage. Logout removes that stored token and clears account-specific application state. localStorage is browser storage, not an HTTP cookie.",
      },
      {
        title: "Shopping state",
        text: "The cart persists in this browser using product IDs, quantities, selection flags and opaque line identifiers, with minimal purchase reservations for safe recovery. Logout hides the account cart and keeps it separate for that account's return; it is not exposed to the next account or guest. Guest choices merge once on sign-in. No cross-device cart synchronization is provided. Pending order metadata is retained in tab-scoped sessionStorage until confirmation or a conclusive rejection of the original attempt. Logout hides the pending purchase; it remains bound to the original account for later sign-in and reconciliation. A retry authentication error does not erase an earlier uncertain purchase. Disabled browser storage limits recovery to the current application session. Signed-in favorites are persisted by the API. The application does not implement marketing analytics or an advertising consent manager.",
      },
      {
        title: "Third-party resources",
        text: "Existing remote imagery and Gravatar may have their own browser/network behavior. This page does not assert control over those services or make a comprehensive claim about their cookies.",
      },
    ],
  },
  license: {
    title: "Asset and license information",
    eyebrow: "DEMO INFORMATION",
    intro:
      "Project code, supplied assets and external references can have different rights. This page does not grant rights owned by someone else.",
    sections: [
      {
        title: "Original catalog illustrations",
        text: "The catalog SVG illustrations were authored for this enhancement and depict product types and colors. They are labeled illustrations rather than product photographs.",
      },
      {
        title: "Design and existing imagery",
        text: "The Figma community reference was used for visual direction. Its technical export does not establish redistribution rights. New raster extraction was avoided; pre-existing asset and third-party image rights still need review before commercial reuse.",
      },
      {
        title: "Dependencies",
        text: "Open-source dependency licenses remain with their respective projects. No blanket license or commercial-clearance claim is made for this entire capstone.",
      },
    ],
  },
  partners: {
    title: "For stores and partners",
    eyebrow: "HOW THE PROJECT WORKS",
    intro:
      "The Store role demonstrates a registration contract with store details. It is not a live marketplace onboarding program.",
    sections: [
      {
        title: "Available today",
        text: "Store registration validates a name, Turkish phone, tax identifier and IBAN-shaped bank details. Use synthetic data in a local demonstration. Sign-in and account identity follow the existing JWT flow.",
      },
      {
        title: "Not implemented",
        text: "Store accounts can manage shipment groups assigned to their verified store. Broader seller dashboards, merchant payouts, advertising services and live business analytics are not implemented. The existing catalog is migration-provided demonstration data.",
      },
    ],
  },
  "how-it-works": {
    title: "How shopping works",
    eyebrow: "A GUIDED DEMO",
    intro:
      "Search real catalog data and inspect the current price, stock and category before adding an item to your cart.",
    sections: [
      {
        title: "Browse and save",
        text: "Use gender/category navigation, search, sorting and pagination. Sign in to save favorites across sessions. Favorites do not add anything to the cart.",
      },
      {
        title: "Checkout and review",
        text: "Select cart lines, choose shipping and receipt addresses, then select a synthetic saved card. The API computes the total and updates inventory transactionally. Previous Orders shows recorded details without claiming a payment or shipment occurred.",
      },
    ],
  },
  apps: {
    title: "Your storefront, wherever you browse",
    eyebrow: "MOBILE WEB AVAILABLE",
    intro:
      "Use the responsive website on your phone. Native mobile applications are not available.",
    sections: [
      {
        title: "App Store — coming soon",
        text: "No iOS app or verified App Store link exists. This is an availability notice, not a download button.",
      },
      {
        title: "Google Play — coming soon",
        text: "No Android app or verified Google Play link exists. Browse the web storefront instead.",
      },
    ],
  },
  demo: {
    title: "Explore the shopping demo",
    eyebrow: "INTERACTIVE WALKTHROUGH",
    intro:
      "A recorded video is not available. Follow the live web flow instead; no playback control is presented.",
    sections: [
      {
        title: "1. Discover",
        text: "Open Shop, choose a collection and search for an item. Product cards link to canonical detail pages.",
      },
      {
        title: "2. Try checkout locally",
        text: "Use an isolated local account and synthetic address/card data. Demo orders update inventory. Do not use real payment information.",
      },
      {
        title: "3. Review",
        text: "Check the server-confirmed summary and Previous Orders. No money is charged and no delivery is promised.",
      },
    ],
  },
  "customer-stories": {
    title: "Designed around the shopping journey",
    eyebrow: "PRODUCT BENEFITS — NOT TESTIMONIALS",
    intro:
      "These are application capabilities, not customer endorsements, usage statistics or real success stories.",
    sections: [
      {
        title: "Find a useful starting point",
        text: "Category and gender filters narrow the full server-side catalog. Search and sorting survive refresh through URL query state.",
      },
      {
        title: "Keep choices clear",
        text: "Favorites are separate from the cart. Billing can match shipping or use another owned address. Order totals come from the API, not client-submitted prices.",
      },
    ],
  },
  developers: {
    title: "API overview",
    eyebrow: "CAPSTONE API — NO PUBLIC API-KEY PORTAL",
    intro:
      "The storefront uses a Spring REST API. This overview documents implemented contracts; availability depends on the configured local or hosted environment.",
    sections: [
      {
        title: "Public catalog",
        text: "GET /health, /roles, /categories, /products and /products/:id. Product queries accept category, gender (k/e), filter (name/description), sort, min_price, max_price, in_stock, limit and offset. Filters run on the server before pagination. Example: GET /products?gender=k&filter=elbise&limit=10&offset=0.",
      },
      {
        title: "Authentication and owned resources",
        text: "POST /signup accepts Customer and Store only. POST /login and GET /verify support the session lifecycle. Protected calls accept Authorization: <session token> (raw JWT; Bearer also supported). Address/card APIs, /user/favorites and /order are owner-scoped. Never put a token in a public example or URL.",
      },
      {
        title: "Demo writes",
        text: "POST /order calculates prices and updates stock transactionally. Optional receipt_address_id defaults to address_id. GET /order returns owned history. GET /user/card/summary returns masked card data; legacy card contracts remain. POST /contact validates and stores a bounded submission with a UUID reference, honeypot and per-instance rate limiter. GET /order/:id/shipments is scoped to the purchasing account. /fulfillment/shipments allows authorized Store-owned groups or all groups for Admin; updates require an expected version and request UUID. Only Admin can assign verified stores to products for future purchases. No public contact reads, public Admin registration or payment-gateway endpoint exists.",
      },
    ],
  },
};

export const faqItems = [
  [
    "Is checkout a real payment?",
    "No. It records a demo order and changes demo inventory. No card is charged or shipment arranged. Use synthetic information only.",
  ],
  [
    "Why must I sign in?",
    "An account is required for saved addresses, cards, persistent favorites and owned order history. Public catalog browsing does not require sign-in.",
  ],
  [
    "Can billing differ from shipping?",
    "Yes. Uncheck the same-as-shipping option and select a second saved address belonging to your account.",
  ],
  [
    "Why is Complete Order disabled?",
    "Select shipping and receipt addresses, an unexpired saved card and at least one cart line, then enter exactly three numeric CCV digits.",
  ],
  [
    "What happens if an order fails?",
    "The cart is retained. The backend rolls back failed transactions. If a network failure leaves the outcome uncertain, check Previous Orders before trying again.",
  ],
  [
    "Where are my favorites?",
    "Signed-in favorites are stored by the API and reloaded for that account. Guest favorites are not stored; logging out clears account-specific favorites from the screen.",
  ],
  [
    "Does contact send an email?",
    "No email service is configured. A successful submission means the message was persisted and a reference was returned.",
  ],
];

export const footerSections = [
  {
    title: "Company",
    links: [
      ["About us", "/about"],
      ["Team", "/team"],
      ["Careers", "/careers"],
      ["Open positions", "/careers#open-positions"],
      ["Blog", "/blog"],
    ],
  },
  {
    title: "Legal (sample)",
    links: [
      ["Privacy notice", "/privacy"],
      ["Terms of service", "/terms"],
      ["Cookie & storage notice", "/cookies"],
      ["License", "/license"],
    ],
  },
  {
    title: "Features",
    links: [
      ["For partners", "/partners"],
      ["How it works", "/how-it-works"],
      ["FAQ", "/faq"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["iOS & Android", "/apps"],
      ["Explore the demo", "/demo"],
      ["Shopping benefits", "/customer-stories"],
      ["API overview", "/developers"],
    ],
  },
];

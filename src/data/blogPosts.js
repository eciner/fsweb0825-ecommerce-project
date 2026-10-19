const articles = [
  {
    slug: "an-everyday-wardrobe-with-fewer-surprises",
    title: "An everyday wardrobe with fewer surprises",
    category: "Shopping guide",
    tags: ["wardrobe", "product information", "favorites"],
    image: "/catalog/navy-jacket.svg",
    imageAlt: "Original navy jacket illustration",
    excerpt:
      "A practical way to compare pieces by purpose, color and the details that matter to you.",
    sections: [
      {
        heading: "Start with the job a piece needs to do",
        text: "A useful wardrobe starts with the situations you actually dress for. Think about the weather, how much you walk, the places you visit and what feels comfortable. A jacket for a daily commute may need different features from one reserved for occasional events. Naming that purpose before browsing helps you compare similar products instead of treating every attractive image as the same kind of purchase.",
      },
      {
        heading: "Read the product, not just the picture",
        text: "Look at the name, description, current price and availability together. Photography and illustrations communicate different things: an illustration can show a product type and color, but it cannot establish texture, fit or material quality. Our demo catalog labels its original illustrations. Treat them as visual guides rather than product photographs, and do not infer sizes or color variants that the product record does not provide.",
      },
      {
        heading: "Keep a shortlist separate from your cart",
        text: "Favorites are useful for saving a thought without turning it into a checkout decision. In this project, signing in stores that shortlist with your account, while the cart remains a separate set of selected items and quantities. Return to a product detail page before proceeding to check its current information. This article is demonstration editorial content; it is not a claim about real merchandise quality, customer experience or commercial availability.",
      },
    ],
  },
  {
    slug: "what-a-demo-order-actually-records",
    title: "What a demo order actually records",
    category: "Behind the project",
    tags: ["checkout", "data integrity", "demo orders"],
    image: "/catalog/tan-bag.svg",
    imageAlt: "Original tan bag illustration",
    excerpt:
      "From selected cart lines to a persisted confirmation, here is what happens without a real payment gateway.",
    sections: [
      {
        heading: "The cart is a proposal",
        text: "A browser can show a price and calculate a provisional total, but the API is responsible for the final order amount. When selected cart lines are submitted, the server looks up the canonical product prices and checks stock. It does not trust a submitted total as the source of truth. This is why the confirmation screen uses the server response instead of simply repeating the number that happened to be visible in the cart.",
      },
      {
        heading: "Data changes belong together",
        text: "Creating an order means saving its lines and changing inventory consistently. If a line fails validation, a partial purchase should not remain behind. The backend uses a transaction and product-row locks to keep stock changes coherent. These mechanisms protect the demonstration data; they do not represent a card authorization, a bank transfer or a promise that a physical package will be dispatched.",
      },
      {
        heading: "Read confirmation carefully",
        text: "The new summary shows the actual order reference, recorded date, server total and persisted item and address snapshots where available. Older orders may not contain all those snapshots, so the interface says what is missing. If a network interruption makes the result uncertain, review Previous Orders before trying again. This editorial walkthrough explains the capstone behavior and does not certify a production payment or fulfillment system.",
      },
    ],
  },
  {
    slug: "keeping-delivery-and-billing-details-clear",
    title: "Keeping delivery and billing details clear",
    category: "Account guide",
    tags: ["addresses", "billing", "order history"],
    image: "/catalog/blue-shirt.svg",
    imageAlt: "Original blue shirt illustration",
    excerpt:
      "Use saved addresses deliberately and understand why purchase-time snapshots matter.",
    sections: [
      {
        heading: "One address when it is enough",
        text: "Many checkout journeys use the same address for delivery and the receipt. The default same-as-shipping option keeps that choice explicit and avoids asking for the same selection twice. When you need a different receipt address, turn the option off and choose another address from your own account. The server checks ownership for both selections; a browser-supplied address identifier alone is not permission to use someone else's address.",
      },
      {
        heading: "Keep important details together",
        text: "A city or neighborhood name is not a complete delivery address. Preserve the street, building, apartment and postal details as well. The form provides province names and a small set of location suggestions, but it also permits free entry when a location is missing or outside Türkiye. Telephone numbers can include an international dialing code. Review the saved text before submitting a demonstration order, using synthetic information rather than real personal data.",
      },
      {
        heading: "History is different from an address book",
        text: "An address book can change after an order. A historical order should not silently switch to the new address merely because a saved entry was edited. New orders therefore store purchase-time address text separately. Earlier orders without a snapshot are identified honestly instead of being reconstructed from today's address book. This is sample editorial content about the project, not shipping guidance for a live commercial service.",
      },
    ],
  },
];

export const blogPosts = articles.map((article) => ({
  ...article,
  byline: "FSWEB0825 Editorial Team",
  date: "2026-10-17",
  demo: true,
  readingMinutes: Math.max(
    1,
    Math.ceil(
      article.sections
        .map((section) => section.text)
        .join(" ")
        .split(/\s+/).length / 200,
    ),
  ),
}));

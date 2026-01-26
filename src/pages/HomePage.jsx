import React from "react";
import ProductCard from "../components/ProductCard.jsx";
import PageContent from "../layout/PageContent.jsx";

const demoProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 129.99,
    badge: "New",
  },
  {
    id: 2,
    name: "Smartwatch",
    price: 199.99,
    badge: "Hot",
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    price: 89.99,
  },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <PageContent>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-600 font-semibold">
              Welcome
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mt-2">
              Your store is ready
            </h1>
            <p className="text-gray-600 mt-3 max-w-2xl">
              Start adding products, categories, and collections. The core stack
              is installed and configured—focus on building the shopping
              experience.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-5 border border-indigo-50">
            <h2 className="text-lg font-semibold text-gray-800">Next steps</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>Add product data and images</li>
              <li>Hook up real API endpoints</li>
              <li>Wire cart and checkout flows</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          {demoProducts.map((product) => (
            <div
              key={product.id}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </PageContent>
    </div>
  );
}

export default HomePage;

import { useState, useMemo } from "react";
import product1 from "../assets/products/product-1.jpg";
import product2 from "../assets/products/product-2.jpg";
import product3 from "../assets/products/product-3.jpg";
import product4 from "../assets/products/product-4.jpg";
import product5 from "../assets/products/product-5.jpg";
import { Link } from "react-router-dom";

import { partnerLogos, products } from "../data/products";

const categoryCards = [
  { id: 1, image: product1, title: "CLOTHS", count: "5 Items" },
  { id: 2, image: product2, title: "CLOTHS", count: "5 Items" },
  { id: 3, image: product3, title: "CLOTHS", count: "5 Items" },
  { id: 4, image: product4, title: "CLOTHS", count: "5 Items" },
  { id: 5, image: product5, title: "CLOTHS", count: "5 Items" },
];

export default function ShopPage() {
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(2);

  // Sort products based on selected option
  const sortedProducts = useMemo(() => {
    const productsCopy = [...products];
    switch (sortBy) {
      case "newest":
        return productsCopy.reverse();
      case "price-low":
        return productsCopy.sort((a, b) => a.salePrice - b.salePrice);
      case "price-high":
        return productsCopy.sort((a, b) => b.salePrice - a.salePrice);
      case "popularity":
      default:
        return productsCopy.sort((a, b) => b.reviews - a.reviews);
    }
  }, [sortBy]);

  const handleFilterApply = () => {
    // Filter logic would go here
    console.log("Applying filters with sort:", sortBy);
  };

  return (
    <div className="w-full bg-[#FAFAFA]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-[#252B42]">Shop</h1>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="text-[#252B42]">Home</span>
            <span className="text-[#BDBDBD]">&gt;</span>
            <span className="text-[#737373]">Shop</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          {categoryCards.map((category) => (
            <article key={category.id} className="relative h-56 overflow-hidden">
              <img
                src={category.image}
                alt={category.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 text-white">
                <h2 className="text-base font-bold tracking-wide">{category.title}</h2>
                <p className="text-sm">{category.count}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="w-full border-y border-[#E8E8E8] bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-[#737373]">Showing all {products.length} results</p>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#252B42]">Views:</span>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded border border-[#E8E8E8] text-[#252B42]"
              aria-label="Grid view"
            >
              ▦
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded border border-[#E8E8E8] text-[#737373]"
              aria-label="List view"
            >
              ≣
            </button>
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 flex-1 rounded border border-[#DDDDDD] px-3 text-sm text-[#737373] md:w-40 md:flex-none"
            >
              <option value="popularity">Popularity</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <button
              type="button"
              onClick={handleFilterApply}
              className="h-10 rounded bg-[#23A6F0] px-6 text-sm font-semibold text-white hover:bg-[#1B8FD8] transition"
            >
              Filter
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-4">
          {sortedProducts.map((product) => (
            <Link
              key={product.id}
              to={`/shop/${product.id}`}
              className="flex flex-col items-center text-center"
            >
              <img
                src={product.image}
                alt={product.title}
                className="h-75 w-full bg-white object-cover"
              />
              <div className="pt-5">
                <h3 className="text-base font-bold text-[#252B42]">{product.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[#737373]">{product.category}</p>
                <div className="mt-2 flex items-center justify-center gap-2 text-sm font-bold">
                  <span className="text-[#BDBDBD]">${product.price.toFixed(2)}</span>
                  <span className="text-[#23856D]">${product.salePrice.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#23A6F0]" />
                  <span className="h-3 w-3 rounded-full bg-[#23856D]" />
                  <span className="h-3 w-3 rounded-full bg-[#E77C40]" />
                  <span className="h-3 w-3 rounded-full bg-[#252B42]" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center">
          <div className="flex overflow-hidden rounded-md border border-[#E8E8E8] bg-white">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="border-r border-[#E8E8E8] px-5 py-4 text-sm font-semibold text-[#BDBDBD] hover:text-[#23A6F0] transition"
            >
              First
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`border-r border-[#E8E8E8] px-4 py-4 text-sm font-semibold transition ${currentPage === 1 ? 'bg-[#23A6F0] text-white' : 'text-[#23A6F0] hover:bg-[#23A6F0]/10'}`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`border-r border-[#E8E8E8] px-4 py-4 text-sm font-semibold transition ${currentPage === 2 ? 'bg-[#23A6F0] text-white' : 'text-[#23A6F0] hover:bg-[#23A6F0]/10'}`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(3)}
              className={`border-r border-[#E8E8E8] px-4 py-4 text-sm font-semibold transition ${currentPage === 3 ? 'bg-[#23A6F0] text-white' : 'text-[#23A6F0] hover:bg-[#23A6F0]/10'}`}
            >
              3
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
              className="px-5 py-4 text-sm font-semibold text-[#23A6F0] hover:bg-[#23A6F0]/10 transition"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="w-full border-t border-[#E8E8E8] bg-[#FAFAFA]">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-[#737373] sm:grid-cols-3 md:grid-cols-5">
          {partnerLogos.map((logo) => (
            <p key={logo} className="text-center text-4xl font-bold text-[#8A8A8A]">
              {logo}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
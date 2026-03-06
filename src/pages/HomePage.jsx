import Slider from "../components/Slider";
import EditorsPick from "../components/EditorsPick";
import HeroProductSlider from "../components/HeroProductSlider";
import BestsellerCard from "../components/BestsellerCard";
import NeuralBanner from "../components/NeuralBanner";
import FeaturedPosts from "../components/FeaturedPosts";
import { products } from "../data/products";

// Get first 8 products for bestsellers section
const bestsellerProducts = products.slice(0, 8);

export default function HomePage() {
  return (
    <div className="w-full">
      <Slider />
      <EditorsPick />

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-12 text-center">
          <p className="text-sm text-[#737373]">Featured Products</p>
          <h2 className="text-2xl font-bold text-[#252B42]">
            Bestseller Products
          </h2>
          <p className="text-sm text-[#737373]">
            Our community-driven favorites, refreshed each week
          </p>
        </div>

        <div className="flex flex-wrap gap-8">
          {bestsellerProducts.map((product) => (
            <div
              key={product.id}
              className="w-full sm:w-[calc(50%-16px)] md:w-[calc(25%-24px)]"
            >
              <BestsellerCard
                image={product.image}
                title={product.title}
                category={product.category}
                price={`$${product.price.toFixed(2)}`}
                salePrice={`$${product.salePrice.toFixed(2)}`}
              />
            </div>
          ))}
        </div>
      </section>

      <HeroProductSlider />
      <NeuralBanner />
      <FeaturedPosts />
    </div>
  );
}

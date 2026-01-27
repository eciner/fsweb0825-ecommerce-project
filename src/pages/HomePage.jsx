import Slider from "../components/Slider";
import EditorsPick from "../components/EditorsPick";
import HeroProductSlider from "../components/HeroProductSlider";
import BestsellerCard from "../components/BestsellerCard";
import NeuralBanner from "../components/NeuralBanner";
import FeaturedPosts from "../components/FeaturedPosts";

import product1 from "../assets/products/product-1.jpg";
import product2 from "../assets/products/product-2.jpg";
import product3 from "../assets/products/product-3.jpg";
import product4 from "../assets/products/product-4.jpg";
import product5 from "../assets/products/product-5.jpg";
import product6 from "../assets/products/product-6.jpg";
import product7 from "../assets/products/product-7.jpg";
import product8 from "../assets/products/product-8.jpg";

const bestsellerProducts = [
  { id: 1, image: product1 },
  { id: 2, image: product2 },
  { id: 3, image: product3 },
  { id: 4, image: product4 },
  { id: 5, image: product5 },
  { id: 6, image: product6 },
  { id: 7, image: product7 },
  { id: 8, image: product8 },
];

export default function HomePage() {
  return (
    <div className="w-full">
      <Slider />
      <EditorsPick />

      <section className="mx-auto w-full max-w-[1200px] px-4 py-16">
        <div className="mb-12 text-center">
          <p className="text-sm text-[#737373]">Featured Products</p>
          <h2 className="text-2xl font-bold text-[#252B42]">
            BESTSELLER PRODUCTS
          </h2>
          <p className="text-sm text-[#737373]">
            Problems trying to resolve the conflict between
          </p>
        </div>

        <div className="flex flex-wrap gap-8">
          {bestsellerProducts.map((product) => (
            <div
              key={product.id}
              className="w-full sm:w-[calc(50%-16px)] md:w-[calc(25%-24px)]"
            >
              <BestsellerCard image={product.image} />
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

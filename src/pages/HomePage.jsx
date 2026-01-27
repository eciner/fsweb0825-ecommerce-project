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
  {
    id: 1,
    image: product1,
    title: "Everyday Cotton Tee",
    category: "Men's Essentials",
    price: "$24.00",
    salePrice: "$18.00",
  },
  {
    id: 2,
    image: product2,
    title: "Cozy Knit Sweater",
    category: "Women's Collection",
    price: "$42.00",
    salePrice: "$32.00",
  },
  {
    id: 3,
    image: product3,
    title: "Weekend Chino Shorts",
    category: "Casual Staples",
    price: "$29.00",
    salePrice: "$21.00",
  },
  {
    id: 4,
    image: product4,
    title: "Textured Linen Shirt",
    category: "Summer Drop",
    price: "$34.00",
    salePrice: "$26.00",
  },
  {
    id: 5,
    image: product5,
    title: "City Runner Sneakers",
    category: "New Arrivals",
    price: "$68.00",
    salePrice: "$54.00",
  },
  {
    id: 6,
    image: product6,
    title: "Minimal Leather Belt",
    category: "Accessories",
    price: "$28.00",
    salePrice: "$20.00",
  },
  {
    id: 7,
    image: product7,
    title: "Heritage Denim Jacket",
    category: "Best Sellers",
    price: "$92.00",
    salePrice: "$76.00",
  },
  {
    id: 8,
    image: product8,
    title: "Everyday Tote Bag",
    category: "Carry Goods",
    price: "$36.00",
    salePrice: "$28.00",
  },
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
                price={product.price}
                salePrice={product.salePrice}
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

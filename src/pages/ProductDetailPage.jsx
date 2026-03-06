import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Eye, Heart, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";

import product6 from "../assets/products/product-6.jpg";
import { partnerLogos, products } from "../data/products";
import { addToCart, toggleFavorite } from "../store/actions";

const colorOptions = ["#23A6F0", "#2DC071", "#E77C40", "#252B42"];

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const parsedId = Number.parseInt(productId, 10);
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites);

  const product = useMemo(
    () => products.find((item) => item.id === parsedId) || products[0],
    [parsedId]
  );

  const galleryImages = useMemo(() => [product.image, product6, product.image], [product]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  const selectedImage = galleryImages[selectedImageIndex] || product.image;
  const bestsellerProducts = products.slice(0, 8);
  const isFavorite = favorites.includes(product.id);

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handleAddToCart = () => {
    dispatch(addToCart(product, 1));
    toast.success(`${product.title} added to cart!`);
  };

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(product.id));
    toast.info(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <div className="w-full bg-[#FAFAFA]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link to="/" className="text-[#252B42] transition hover:text-[#23A6F0]">
            Home
          </Link>
          <span className="text-[#BDBDBD]">&gt;</span>
          <Link to="/shop" className="text-[#737373] transition hover:text-[#23A6F0]">
            Shop
          </Link>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div>
            <div className="relative overflow-hidden bg-white">
              <img
                src={selectedImage}
                alt={product.title}
                className="h-75 w-full object-cover sm:h-105"
              />

              <button
                type="button"
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#737373]"
                aria-label="Show previous image"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#737373]"
                aria-label="Show next image"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={`${product.id}-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`overflow-hidden border transition ${
                    selectedImageIndex === index ? "border-[#23A6F0]" : "border-transparent"
                  }`}
                  aria-label={`Select image ${index + 1}`}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} className="h-20 w-24 object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-[#252B42]">{product.title}</h1>

            <div className="mt-4 flex items-center gap-1">
              {Array.from({ length: Math.floor(product.rating) }).map((_, index) => (
                <span key={index} className="text-base text-[#F3CD03]">★</span>
              ))}
              {Array.from({ length: 5 - Math.floor(product.rating) }).map((_, index) => (
                <span key={index} className="text-base text-[#BDBDBD]">☆</span>
              ))}
              <span className="ml-2 text-sm font-semibold text-[#737373]">{product.reviews} Reviews</span>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#252B42]">{formatCurrency(product.salePrice)}</p>
            {product.price !== product.salePrice && (
              <p className="mt-1 text-lg text-[#BDBDBD] line-through">{formatCurrency(product.price)}</p>
            )}

            <p className="mt-4 text-sm font-semibold text-[#737373]">
              Availability : <span className={product.inStock ? "text-[#23A6F0]" : "text-[#E74040]"}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </p>

            <p className="mt-6 max-w-lg text-sm leading-6 text-[#858585]">
              {product.description}
            </p>

            <div className="mt-7 border-t border-[#E8E8E8] pt-7">
              <div className="flex items-center gap-3">
                {colorOptions.map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    className={`h-8 w-8 rounded-full ${
                      selectedColor === color ? "ring-2 ring-offset-2 ring-[#23A6F0]" : ""
                    }`}
                    aria-label="Select product color"
                  />
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="h-11 rounded bg-[#23A6F0] px-6 text-sm font-semibold text-white disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#1B8FD8] transition"
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                    isFavorite ? "border-[#E74040] text-[#E74040]" : "border-[#E8E8E8] text-[#252B42]"
                  }`}
                  aria-label="Add to favorites"
                >
                  <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E8E8] text-[#252B42] disabled:text-gray-400 disabled:cursor-not-allowed hover:border-[#23A6F0] hover:text-[#23A6F0] transition"
                  aria-label="Quick add to cart"
                >
                  <ShoppingCart size={16} />
                </button>

                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E8E8] text-[#252B42] hover:border-[#23A6F0] hover:text-[#23A6F0] transition"
                  aria-label="Preview product"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="w-full border-y border-[#ECECEC] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-[#737373] md:justify-start">
            <button type="button" className="text-[#252B42]">Description</button>
            <button type="button">Additional Information</button>
            <button type="button">
              Reviews <span className="text-[#23856D]">(0)</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr]">
        <img src={product6} alt="Product detail" className="h-full min-h-80 w-full object-cover" />

        <div>
          <h2 className="text-2xl font-bold text-[#252B42]">the quick fox jumps over</h2>
          <div className="mt-5 space-y-6 text-sm leading-6 text-[#737373]">
            <p>
              Met minim Mollie non desert Alamo est sit cliquey dolor do met sent. RELIT
              official consequent door ENIM RELIT Mollie. Excitation venial consequent sent
              nostrum met.
            </p>
            <p>
              Met minim Mollie non desert Alamo est sit cliquey dolor do met sent. RELIT
              official consequent door ENIM RELIT Mollie. Excitation venial consequent sent
              nostrum met.
            </p>
            <p>
              Met minim Mollie non desert Alamo est sit cliquey dolor do met sent. RELIT
              official consequent door ENIM RELIT Mollie. Excitation venial consequent sent
              nostrum met.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#252B42]">the quick fox jumps over</h2>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[#737373]">
              {Array.from({ length: 4 }).map((_, index) => (
                <li key={index} className="flex items-center gap-2">
                  <ChevronRight size={16} className="text-[#737373]" />
                  the quick fox jumps over the lazy dog
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#252B42]">the quick fox jumps over</h2>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-[#737373]">
              {Array.from({ length: 3 }).map((_, index) => (
                <li key={index} className="flex items-center gap-2">
                  <ChevronRight size={16} className="text-[#737373]" />
                  the quick fox jumps over the lazy dog
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <h2 className="text-3xl font-bold uppercase tracking-wide text-[#252B42]">Bestseller Products</h2>

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellerProducts.map((item) => (
            <Link
              key={item.id}
              to={`/shop/${item.id}`}
              className="bg-white transition hover:shadow-sm"
            >
              <img src={item.image} alt={item.title} className="h-72 w-full object-cover" />
              <div className="p-4">
                <h3 className="text-base font-bold text-[#252B42]">{item.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[#737373]">{item.category}</p>
                <div className="mt-3 flex items-center gap-2 text-sm font-bold">
                  <span className="text-[#BDBDBD]">{formatCurrency(item.price)}</span>
                  <span className="text-[#23856D]">{formatCurrency(item.salePrice)}</span>
                </div>
              </div>
            </Link>
          ))}
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
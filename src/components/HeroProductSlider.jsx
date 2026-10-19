import { Link } from "react-router-dom";
import model from "../assets/hero/hero-product.png";

export default function HeroProductSlider() {
  return (
    <section className="w-full overflow-hidden bg-success text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-16 md:flex-row md:justify-between">
        <div className="flex max-w-lg flex-col gap-6">
          <p className="text-sm font-bold tracking-widest">THE EVERYDAY EDIT</p>
          <h2 className="text-4xl font-bold leading-tight md:text-6xl">
            Find your next
            <br />
            everyday favorite.
          </h2>
          <p>
            Explore clothes, shoes and bags. See each product's current price
            and stock in the catalog.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/shop?gender=e"
              className="rounded-control bg-white px-7 py-3 font-bold text-success hover:bg-surface"
            >
              SHOP MEN
            </Link>
            <Link
              to="/shop?gender=k"
              className="rounded-control border border-white px-7 py-3 font-bold hover:bg-white/10"
            >
              SHOP WOMEN
            </Link>
          </div>
        </div>
        <img
          src={model}
          alt="Editorial collection styling"
          loading="lazy"
          className="max-h-96 w-full max-w-sm object-contain"
        />
      </div>
    </section>
  );
}

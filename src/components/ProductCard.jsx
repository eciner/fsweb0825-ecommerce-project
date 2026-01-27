import { memo } from "react";
import { Heart } from "lucide-react";
import { interactiveButton } from "../utils/buttonClasses";

function ProductCard({ title, price, image }) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl border bg-white">
      <div className="flex w-full">
        <img
          src={image}
          alt={title || "Product"}
          loading="lazy"
          className="h-44 w-full object-cover md:h-56"
        />
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex text-sm font-semibold md:text-base">{title}</h3>
          <button
            type="button"
            className={`${interactiveButton} flex items-center justify-center rounded-lg border px-2 py-2 text-[#252B42] hover:border-green-light hover:text-[#2DC071] focus:ring-[#2DC071]`}
            aria-label="Add to favorites"
          >
            <Heart size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex text-sm font-bold md:text-base">${price}</span>
          <button
            type="button"
            className={`${interactiveButton} flex items-center justify-center rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-[#1f1f1f] focus:ring-[#2DC071] md:text-sm`}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);

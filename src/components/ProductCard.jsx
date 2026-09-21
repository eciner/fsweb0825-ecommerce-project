import { memo } from "react";
import { Link } from "react-router-dom";

import { FALLBACK_PRODUCT_IMAGE } from "../utils/productModel";

function ProductCard({ product, to, imageHeight = "h-75" }) {
  const safeRating = Number.isFinite(product.rating) ? product.rating : 0;

  const content = (
    <>
      <img
        src={product.image}
        alt={product.title}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
        }}
        loading="lazy"
        className={`${imageHeight} w-full bg-white object-cover`}
      />
      <div className="pt-5">
        <h3 className="text-base font-bold text-[#252B42]">{product.title}</h3>
        <p className="mt-1 text-sm font-semibold text-[#737373]">
          {product.category}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-[#23856D]">
          <span>${product.price.toFixed(2)}</span>
        </div>

        <div className="mt-2 text-xs text-[#737373]">
          Rating {safeRating.toFixed(2)} / 5
        </div>
        <div className="mt-1 text-xs text-[#737373]">
          {product.sellCount} sold
        </div>
      </div>
    </>
  );

  if (!to) {
    return (
      <article className="flex w-full flex-col items-center text-center">
        {content}
      </article>
    );
  }

  return (
    <Link
      to={to}
      className="flex w-full cursor-pointer flex-col items-center text-center transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#23A6F0] focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}

export default memo(ProductCard);

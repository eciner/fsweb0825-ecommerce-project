import { memo } from "react";

function BestsellerCard({ image, title, category, price, salePrice }) {
  return (
    <div className="flex w-full flex-col bg-white">
      <div className="w-full bg-[#F1F1F1]">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-75 w-full object-cover"
        />
      </div>

      <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
        <p className="text-center text-base font-bold text-[#252B42]">
          {title}
        </p>

        <p className="text-sm text-[#737373]">{category}</p>

        <div className="flex gap-2 font-bold">
          <span className="text-[#BDBDBD]">{price}</span>
          <span className="text-[#23856D]">{salePrice}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(BestsellerCard);

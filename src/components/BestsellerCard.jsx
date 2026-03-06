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
        <button
          type="button"
          className="text-center text-base font-bold text-[#252B42] transition-colors duration-150 hover:text-[#23A6F0] focus:outline-none focus-visible:underline cursor-pointer"
        >
          {title}
        </button>

        <button
          type="button"
          className="text-sm text-[#737373] transition-colors duration-150 hover:text-[#23A6F0] focus:outline-none focus-visible:underline cursor-pointer"
        >
          {category}
        </button>

        <div className="flex gap-2">
          <span
            className="h-4 w-4 rounded-full bg-[#23A6F0]"
            aria-label="Blue color option"
          />
          <span
            className="h-4 w-4 rounded-full bg-[#23856D]"
            aria-label="Green color option"
          />
          <span
            className="h-4 w-4 rounded-full bg-[#E77C40]"
            aria-label="Orange color option"
          />
          <span
            className="h-4 w-4 rounded-full bg-[#252B42]"
            aria-label="Navy color option"
          />
        </div>

        <div className="flex gap-2 font-bold">
          <span className="text-[#BDBDBD]">{price}</span>
          <span className="text-[#23856D]">{salePrice}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(BestsellerCard);

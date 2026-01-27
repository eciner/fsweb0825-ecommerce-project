import { memo } from "react";

function BestsellerCard({ image }) {
  return (
    <div className="flex w-full flex-col bg-white">
      <div className="w-full bg-[#F1F1F1]">
        <img
          src={image}
          alt="Bestseller product"
          loading="lazy"
          className="h-[300px] w-full object-cover"
        />
      </div>

      <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
        <h5 className="font-bold text-[#252B42]">Graphic Design</h5>

        <p className="text-sm text-[#737373]">English Department</p>

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
          <span className="text-[#BDBDBD]">$16.48</span>
          <span className="text-[#23856D]">$6.48</span>
        </div>
      </div>
    </div>
  );
}

export default memo(BestsellerCard);

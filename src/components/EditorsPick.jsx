import { memo } from "react";
import menImg from "../assets/editors-men.png";
import womenImg from "../assets/editors-women.png";
import kidsImg from "../assets/editors-kids.png";
import accessoriesImg from "../assets/editors-accessories.png";

const Card = memo(function Card({ img, label, position = "object-center" }) {
  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden bg-[#F1F1F1]">
      <img
        src={img}
        alt={`${label} collection`}
        loading="lazy"
        className={`h-full w-full object-cover ${position}`}
      />

      <div className="absolute left-6 bottom-6 bg-white px-8 py-3 text-sm font-bold tracking-wide text-[#252B42]">
        {label}
      </div>
    </div>
  );
});

function EditorsPick() {
  return (
    <section className="w-full bg-[#FAFAFA] py-20">
      {/* Title */}
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 text-center">
        <h2 className="text-2xl font-bold text-[#252B42]">
          EDITOR&apos;S PICK
        </h2>
        <p className="mt-2 text-sm text-[#737373]">
          Problems trying to resolve the conflict between
        </p>
      </div>

      {/* FLEX LAYOUT */}
      <div className="mx-auto mt-12 w-full max-w-6xl px-4">
        <div className="flex flex-col gap-6 md:flex-row md:h-[560px] md:items-stretch">
          {/* MEN */}
          <div className="md:flex-[2] md:h-full min-h-0">
            <Card img={menImg} label="MEN" position="object-[50%_15%]" />
          </div>

          {/* WOMEN */}
          <div className="md:flex-1 md:h-full min-h-0">
            <Card img={womenImg} label="WOMEN" position="object-[50%_20%]" />
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6 md:flex-1 md:h-full min-h-0">
            <div className="md:flex-1 min-h-0">
              <Card
                img={accessoriesImg}
                label="ACCESSORIES"
                position="object-[50%_0%]"
              />
            </div>

            <div className="md:flex-1 min-h-0">
              <Card img={kidsImg} label="KIDS" position="object-[50%_15%]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(EditorsPick);

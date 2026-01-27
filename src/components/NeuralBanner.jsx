import { memo } from "react";
import bannerImg from "../assets/banners/banner-neural.jpg";

function NeuralBanner() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-10 px-6 py-16 md:flex-row md:gap-14">
        <div className="w-full md:w-1/2">
          <img
            src={bannerImg}
            alt="Banner"
            loading="lazy"
            className="w-full object-cover"
          />
        </div>

        <div className="flex w-full flex-col items-start gap-4 md:w-1/2">
          <p className="text-sm font-bold tracking-[0.2em] text-[#737373]">
            SUMMER 2020
          </p>

          <h2 className="text-3xl font-bold leading-tight text-[#252B42] md:text-5xl">
            Part of the Neural <br /> Universe
          </h2>

          <p className="max-w-[420px] text-sm text-[#737373] md:text-base">
            We know how large objects will act, but things on a small scale.
          </p>

          <div className="mt-2 flex gap-4">
            <button
              type="button"
              className="rounded-md bg-[#2DC071] px-8 py-3 text-sm font-bold text-white"
            >
              BUY NOW
            </button>

            <button
              type="button"
              className="rounded-md border border-[#2DC071] px-8 py-3 text-sm font-bold text-[#2DC071]"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(NeuralBanner);

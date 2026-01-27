import { memo, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { interactiveButton } from "../utils/buttonClasses";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import slide1 from "../assets/hero/hero-product.png";
import slide2 from "../assets/hero/hero-product-2.png";

const slides = [
  {
    season: "SUMMER 2020",
    title: "Vita Classic Product",
    desc: "We know how large objects will act, We know how are objects will act, We know.",
    price: "$16.48",
    image: slide1,
    alt: "Vita Classic Product - Summer 2020",
  },
  {
    season: "WINTER 2020",
    title: "Vita Classic Product",
    desc: "We know how large objects will act, We know how are objects will act, We know.",
    price: "$18.48",
    image: slide2,
    alt: "Vita Classic Product - Winter 2020",
  },
];

function HeroProductSlider() {
  const [progress, setProgress] = useState(0);

  const swiperRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  const duration = 4000;

  const nextSlide = () => swiperRef.current?.slideNext();
  const prevSlide = () => swiperRef.current?.slidePrev();

  const startProgress = () => {
    startRef.current = performance.now();

    const animate = (now) => {
      const elapsed = now - startRef.current;
      const percent = Math.min(100, (elapsed / duration) * 100);
      setProgress(percent);

      if (elapsed >= duration) return;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    startProgress();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#23856D]">
      <button
        onClick={prevSlide}
        className={`${interactiveButton} hidden md:flex absolute left-5 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 p-3 text-white hover:scale-105 hover:bg-white/40 focus:ring-white focus:ring-offset-green-accent`}
        aria-label="Previous"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={nextSlide}
        className={`${interactiveButton} hidden md:flex absolute right-5 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 p-3 text-white hover:scale-105 hover:bg-white/40 focus:ring-white focus:ring-offset-green-accent`}
        aria-label="Next"
      >
        <ChevronRight size={28} />
      </button>

      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        modules={[Autoplay]}
        autoplay={{
          delay: duration,
          disableOnInteraction: false,
        }}
        loop={true}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={() => {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          startProgress();
        }}
        className="w-full"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={i}>
            <div className="mx-auto flex min-h-[520px] w-full max-w-[1200px] flex-col items-center gap-10 px-6 py-16 md:flex-row md:justify-between md:py-20">
              <div className="flex max-w-[520px] flex-col gap-6 text-white">
                <p className="text-sm font-bold tracking-[0.2em]">{s.season}</p>

                <h2 className="text-4xl font-bold leading-tight md:text-6xl">
                  Vita Classic <br /> Product
                </h2>

                <p className="text-sm text-white/90 md:text-base">{s.desc}</p>

                <div className="flex items-center gap-6">
                  <span className="text-2xl font-bold">{s.price}</span>

                  <button
                    type="button"
                    className={`${interactiveButton} rounded-md bg-[#2DC071] px-8 py-3 text-sm font-bold text-white hover:bg-[#2DC071]-dark focus:ring-white`}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>

              <div className="relative flex w-full max-w-[420px] justify-center">
                <img
                  src={s.image}
                  alt={s.alt}
                  loading="lazy"
                  className="
                    w-[65%] translate-y-10 object-contain
                    md:w-[85%] md:translate-y-20
                  "
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Progress bar */}
      <div className="absolute bottom-8 left-1/2 flex w-[140px] -translate-x-1/2">
        <div className="flex h-[6px] w-full bg-white/35">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}

export default memo(HeroProductSlider);

import { memo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import heroWoman from "../assets/hero-woman.jpg";
import heroWoman2 from "../assets/hero-woman-2.png";
import { interactiveButton } from "../utils/buttonClasses";

const slides = [
  {
    image: heroWoman,
    alt: "Summer collection hero image",
    title: "NEW COLLECTION",
    subtitle: "SUMMER 2020",
    description:
      "We know how large objects will act, but things on a small scale.",
  },
  {
    image: heroWoman2,
    alt: "Summer collection hero image 2",
    title: "NEW COLLECTION",
    subtitle: "SUMMER 2020",
    description:
      "We know how large objects will act, but things on a small scale.",
  },
];

function Slider() {
  const swiperRef = useRef(null);

  return (
    <div className="w-full overflow-hidden">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        modules={[Autoplay]}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        loop={true}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <section className="relative flex h-screen w-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.alt}
                loading={index === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover object-[62%_50%] md:object-[78%_50%] lg:object-[85%_50%]"
              />

              <div className="absolute inset-0 bg-[#23A6F0]/25" />

              <div className="absolute inset-0 flex w-full">
                <div className="flex w-full flex-col justify-center gap-4 px-6 pt-28 md:px-16 md:pt-32">
                  <span className="flex text-sm font-bold tracking-[0.2em] text-white md:text-base">
                    {slide.subtitle}
                  </span>

                  <h1 className="flex max-w-[520px] text-4xl font-bold text-white md:text-6xl">
                    {slide.title}
                  </h1>

                  <p className="flex max-w-[420px] text-sm font-medium text-white/90 md:text-base">
                    {slide.description}
                  </p>

                  <button
                    type="button"
                    className={`${interactiveButton} flex w-fit items-center justify-center rounded-md bg-[#2DC071] px-6 py-3 text-sm font-bold text-white hover:bg-[#2DC071]-dark focus:ring-[#2DC071] md:text-base`}
                  >
                    SHOP NOW
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#252B42] shadow-lg backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent cursor-pointer md:left-8"
                aria-label="Previous slide"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#252B42] shadow-lg backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent cursor-pointer md:right-8"
                aria-label="Next slide"
              >
                <ChevronRight size={22} />
              </button>
            </section>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default memo(Slider);

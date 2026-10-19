import { memo, useRef } from "react";
import { Link } from "react-router-dom";
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
    subtitle: "EVERYDAY STYLE",
    description: "Explore the current collection, with real prices and stock.",
  },
  {
    image: heroWoman2,
    alt: "Summer collection hero image 2",
    title: "NEW COLLECTION",
    subtitle: "EVERYDAY STYLE",
    description: "Explore the current collection, with real prices and stock.",
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
        autoplay={false}
        loop={true}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.image}>
            <section className="relative flex h-screen w-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.alt}
                loading={slide.image === slides[0].image ? "eager" : "lazy"}
                className="h-full w-full object-cover object-[62%_50%] md:object-[78%_50%] lg:object-[85%_50%]"
              />

              <div className="absolute inset-0 bg-linear-to-r from-ink/70 via-ink/20 to-transparent" />

              <div className="absolute inset-0 flex w-full">
                <div className="flex w-full flex-col justify-center gap-4 px-6 pt-28 md:px-16 md:pt-32">
                  <span className="flex text-sm font-bold tracking-[0.2em] text-white md:text-base">
                    {slide.subtitle}
                  </span>

                  <h1 className="flex max-w-130 text-4xl font-bold text-white md:text-6xl">
                    {slide.title}
                  </h1>

                  <p className="flex max-w-105 text-sm font-medium text-white/90 md:text-base">
                    {slide.description}
                  </p>

                  <Link
                    to="/shop?gender=k"
                    className={`${interactiveButton} flex w-fit items-center justify-center rounded-md bg-success px-6 py-3 text-sm font-bold text-white hover:bg-[#1f755f] focus:ring-[#2DC071] md:text-base`}
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-4 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-[#252B42] shadow-lg backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#23A6F0] cursor-pointer md:left-8"
                aria-label="Previous slide"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-4 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-[#252B42] shadow-lg backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#23A6F0] cursor-pointer md:right-8"
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

"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { formatForUrl } from "../../../utils/format/url.format";
import { News } from "../../../types/News";

interface BannerSliderProps {
  slides: News[];
}

const Banner: React.FC<BannerSliderProps> = ({ slides }) => {
  return (
    <div className="relative w-full max-w-[1100px] mx-auto h-[420px] overflow-hidden rounded-[28px] border border-white/70 bg-white/60 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.55)]">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        navigation={{
          prevEl: ".swiper-button-prev",
          nextEl: ".swiper-button-next",
        }}
        pagination={{ clickable: true }}
        loop
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id.toString()}>
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-10 left-6 right-6 md:left-10 md:right-10 text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  Featured
                </div>
                <p className="font-display mt-3 text-3xl md:text-4xl font-semibold overflow-hidden align-middle text-ellipsis line-clamp-2">
                  {slide.title}
                </p>
                <p className="mt-2 text-sm md:text-base text-white/90 line-clamp-1">
                  {new Date(slide.updatedAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  - <b>{slide.category}</b> -{" "}
                  <Link
                    href={`/${formatForUrl(slide.category)}/${slide.title_seo}`}
                    className="text-sm underline underline-offset-4 hover:text-white"
                  >
                    Lihat Lebih Detail
                  </Link>
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}

        <div className="swiper-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-4xl text-white hover:text-gray-200">
          <IoIosArrowDropleft />
        </div>
        <div className="swiper-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer text-4xl text-white hover:text-gray-200">
          <IoIosArrowDropright />
        </div>
      </Swiper>
    </div>
  );
};

export default Banner;

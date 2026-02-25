"use client";
import Banner from "./components/Banner";
import Cards from "./components/Cards";
import Header from "./components/Header";
import SkeletonBanner from "./components/skeleton/SkeletonBanner";
import SkeletonCards from "./components/skeleton/SkeletonCards";
import useFetchNews from "../../utils/hook/useFetchNews";
import AlertManager from "./components/AlertManager";

export default function Home() {
  const { newsData, error, isLoading } = useFetchNews(
    10,
    "approved",
    "",
    "",
    "",
    "latest"
  );

  if (error) {
    return (
      <div>
        Error: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  const slides = newsData.slice(0, 5);
  const cardsData = newsData.slice(5, 10);

  return (
    <div className="w-full max-w-full min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbfa,_#fdf6f1,_#f5f8ff)]">
      <AlertManager path="/" />
      <Header />
      {isLoading ? <SkeletonBanner /> : <Banner slides={slides} />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 my-6 max-w-[1100px] mx-4 lg:mx-auto">
        <div className="font-display text-2xl md:text-3xl text-slate-900 font-semibold">
          Berita Tren Terbaru
        </div>
        <div className="bg-secondary text-emerald-700 px-4 py-2 rounded-full hover:bg-emerald-100 cursor-pointer font-semibold uppercase tracking-[0.2em] text-xs w-fit">
          terkini
        </div>
      </div>
      <div className="max-w-[1100px] mx-auto">
        {isLoading ? <SkeletonCards /> : <Cards data={cardsData} />}
      </div>
    </div>
  );
}

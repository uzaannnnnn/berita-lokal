"use client";
import { useParams } from "next/navigation";
import Header from "../components/Header";
import Cards from "../components/Cards";
import useFetchNews from "../../../utils/hook/useFetchNews";
import SkeletonCards from "../components/skeleton/SkeletonCards";
import Custom404 from "../not-found";
import { formatForCategory } from "../../../utils/format/url.format";

const allowedCategories = [
  "peristiwa-lokal",
  "ekonomi",
  "bisnis",
  "politik",
  "kesehatan",
  "pendidikan",
  "budaya",
  "pariwisata",
  "teknologi",
  "komunitas",
  "sosial",
  "properti",
];

export default function Category() {
  const params = useParams();
  const { category } = params;
  const categoryStr = String(category);

  if (!allowedCategories.includes(categoryStr)) {
    return <Custom404 />;
  }

  const { newsData, error, isLoading } = useFetchNews(
    5,
    "approved",
    categoryStr.split("-").join(" ")
  );

  if (error) {
    return (
      <div>
        Error: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbfa,_#fdf6f1,_#f5f8ff)]">
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 lg:px-0">
        <div className="mt-6 mb-4 rounded-[24px] border border-white/70 bg-white/70 px-6 py-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                Kategori
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
                Berita {formatForCategory(categoryStr)}
              </h1>
              <p className="text-sm text-slate-500">
                Liputan paling relevan dari komunitas lokal.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
                terlama
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10">
          {isLoading ? <SkeletonCards /> : <Cards data={newsData} />}
        </div>
      </div>
    </div>
  );
}

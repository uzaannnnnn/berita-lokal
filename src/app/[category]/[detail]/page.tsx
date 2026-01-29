"use client";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import { useFetchDetailNews } from "../../../../utils/hook/useFetchDetailNews";
import {
  formatForCategory,
  formatForUrl,
} from "../../../../utils/format/url.format";
import SkeletonDetail from "../../components/skeleton/SkeletonDetail";
import NewsDetail from "../../vendor/dangerouslySetInnerHTML";

export default function Detail() {
  const params = useParams();
  const { detail } = params;
  const detailStr = String(detail);

  const { newsDetail, moreNewsByAuthor, author, isLoading } =
    useFetchDetailNews(detailStr, 5);

  if (isLoading) {
    return <SkeletonDetail />;
  }

  if (!newsDetail) {
    return <div>News not found.</div>;
  }

  const authorImage =
    author?.image && author.image.startsWith("http")
      ? author.image
      : `/images/${author?.image || "user.png"}`;

  return (
    <div className="flex flex-col w-full max-w-full min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbfa,_#fdf6f1,_#f5f8ff)] px-4 lg:px-0">
      <Header />
      {newsDetail ? (
        <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto my-6 gap-8">
          <div className="flex-1">
            <div className="rounded-[24px] border border-white/70 bg-white/70 px-6 py-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                {formatForCategory(newsDetail.category)}
              </p>
              <h1 className="font-display mt-2 text-2xl lg:text-3xl font-semibold text-slate-900">
                {newsDetail.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(newsDetail.updatedAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="border border-slate-200 rounded-full w-[52px] h-[52px] overflow-hidden bg-slate-100">
                    <img
                      src={authorImage}
                      alt={author?.name || "Author"}
                      className="object-cover w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      {author?.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {author?.profession || "Penulis"}
                    </p>
                  </div>
                </div>

                {newsDetail.status === "approved" ? (
                  <span className="text-xs font-semibold text-emerald-700">
                    Disetujui
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-600">
                    Draft
                  </span>
                )}
              </div>
            </div>

            <div className="relative w-full h-[360px] md:h-[440px] lg:h-[520px] overflow-hidden mt-6 rounded-[24px] border border-white/70 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.4)]">
              <img
                src={newsDetail.image}
                alt="Gambar Detail"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-8 rounded-[24px] border border-white/70 bg-white/70 px-6 py-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.4)] backdrop-blur">
              <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                <NewsDetail content={newsDetail.content} />
              </div>
            </div>
          </div>

          <div className="w-full md:w-[320px] lg:w-[360px] md:mt-8">
            <h2 className="font-display text-lg font-semibold mb-4 text-slate-900">
              Berita Lain dari Penulis
            </h2>
            <div className="space-y-4">
              {moreNewsByAuthor.length === 1 ? (
                <div className="rounded-2xl border border-white/70 bg-white/70 px-6 py-6 text-center text-slate-500">
                  Tidak ada berita lain.
                </div>
              ) : (
                moreNewsByAuthor
                  .filter((news) => news.title !== newsDetail.title)
                  .slice(0, 3)
                  .map((news) => (
                    <a
                      key={news.id}
                      href={`/${formatForUrl(news.category)}/${formatForUrl(
                        news.title
                      )}`}
                      className="block border border-slate-200 rounded-2xl p-3 bg-white/80 hover:shadow-md transition-shadow duration-200 hover:cursor-pointer"
                    >
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-36 object-cover rounded-xl mb-3"
                      />
                      <h3 className="font-semibold text-sm text-slate-900 mb-2 line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {new Date(news.updatedAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </a>
                  ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <p className="text-slate-500">404 - News not found</p>
        </div>
      )}
    </div>
  );
}

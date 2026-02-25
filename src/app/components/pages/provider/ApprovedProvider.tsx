"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../utils/hook/useAuth";
import useFetchNews from "../../../../../utils/hook/useFetchNews";
import SkeletonCards from "../../skeleton/SkeletonCards";
import Cards from "../../Cards";
import { FiLogOut } from "react-icons/fi";
import Pagination from "../../Pagination";

const ApprovedProvider: React.FC<DashboardProps> = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPullingNews, setIsPullingNews] = useState(false);
  const [pullResultMessage, setPullResultMessage] = useState<string | null>(
    null
  );
  const [pullErrorMessage, setPullErrorMessage] = useState<string | null>(null);
  const pathname = usePathname();
  const { logout, isLoading: loading } = useAuth();
  const profileImageSrc = user?.image?.startsWith("http")
    ? user.image
    : `/images/${user?.image}`;
  const handleLogout = async () => {
    await logout();
  };

  const { newsData, isLoading, refetch } = useFetchNews(
    1000,
    "approved",
    "",
    "provider",
    ""
  );
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(newsData.length / itemsPerPage));
  const pageData = newsData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [newsData.length]);

  const handlePullNews = async () => {
    setIsPullingNews(true);
    setPullResultMessage(null);
    setPullErrorMessage(null);

    try {
      const res = await fetch("/api/provider", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Gagal menarik berita dari provider.");
      }

      setPullResultMessage(
        data.message || "Berhasil menarik berita dari provider."
      );

      await refetch();
    } catch (error) {
      setPullErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menarik berita."
      );
    } finally {
      setIsPullingNews(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbfa,_#fdf6f1,_#f5f8ff)] text-slate-900">
      <button
        className="fixed top-4 left-4 z-50 rounded-full border border-white/70 bg-white/80 p-2 shadow-lg backdrop-blur lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-slate-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      <div
        className={`fixed inset-y-0 left-0 w-72 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } border-r border-white/70 bg-white/85 text-slate-700 shadow-xl backdrop-blur transition-transform lg:translate-x-0 z-40`}
      >
        <div className="p-6 relative flex justify-between items-center">
          <h2 className="text-2xl font-display font-semibold text-slate-900">
            <a href="/dashboard">Provider</a>
          </h2>
          <button
            className="lg:hidden text-slate-500 hover:text-slate-900"
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav>
          <ul>
            <li>
              <a
                href="/dashboard"
                className={`mx-3 my-1 block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  pathname === "/dashboard"
                    ? "bg-emerald-100 text-emerald-900"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                Berita Tertunda
              </a>
            </li>
            <li>
              <a
                href="/news/approved"
                className={`mx-3 my-1 block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  pathname === "/news/approved"
                    ? "bg-emerald-100 text-emerald-900"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                Berita Disetujui
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="flex-1 ml-0 lg:ml-72 transition-all">
        <header className="mx-4 mt-4 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur lg:mx-8">
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">
              Berita Disetujui
            </p>
            <p className="text-xs text-slate-500">
              Daftar berita lolos kurasi provider
            </p>
          </div>
          <div className="relative">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="mr-2 text-slate-700 font-semibold">
                {user?.name}
              </span>
              <img
                src={profileImageSrc}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full ring-2 ring-white"
              />
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-6 w-60 rounded-2xl border border-white/70 bg-white/95 shadow-xl">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/70">
                  <img
                    src={profileImageSrc}
                    alt="Profile"
                    width={44}
                    height={44}
                    className="rounded-full ring-2 ring-white"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500">Provider</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  <FiLogOut className="mr-2" />
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 pb-10 pt-6 lg:px-8">
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
                Berita Disetujui
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Konten yang sudah valid dan siap dipublikasikan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-secondary text-emerald-700 px-4 py-2 rounded-full font-semibold uppercase tracking-[0.2em] text-xs">
                approved
              </span>
              <button
                type="button"
                onClick={handlePullNews}
                disabled={isPullingNews}
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPullingNews ? "Menarik..." : "Tarik Berita"}
              </button>
            </div>
          </div>
          {pullResultMessage && (
            <p className="mt-3 text-sm text-emerald-700">{pullResultMessage}</p>
          )}
          {pullErrorMessage && (
            <p className="mt-3 text-sm text-rose-600">{pullErrorMessage}</p>
          )}
          <div className="mt-6">
            {isLoading ? (
              <SkeletonCards />
            ) : (
              <Cards
                data={pageData}
                role={user?.role}
                showActions={true}
                showView={true}
                showCancel={true}
              />
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApprovedProvider;

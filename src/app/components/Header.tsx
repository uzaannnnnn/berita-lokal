"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { useSearch } from "../../../utils/hook/useSearch";
import { formatForUrl } from "../../../utils/format/url.format";
import { useAuthStatus } from "../../../utils/hook/useAuthStatus";
import { useAuth } from "../../../utils/hook/useAuth";

export default function Header() {
  const {
    searchQuery,
    handleSearchChange,
    handleSearchSubmit,
    searchResults,
    isLoading,
    setSearchResults,
  } = useSearch();

  const categoryContainerRef = useRef<HTMLDivElement | null>(null);

  const { isAuthenticated, loading, user } = useAuthStatus();
  const { logout, isLoading: logoutLoading } = useAuth();

  const categories = [
    { path: "/", label: "Terbaru" },
    { path: "/peristiwa-lokal", label: "Peristiwa Lokal" },
    { path: "/ekonomi", label: "Ekonomi" },
    { path: "/bisnis", label: "Bisnis" },
    { path: "/politik", label: "Politik" },
    { path: "/kesehatan", label: "Kesehatan" },
    { path: "/pendidikan", label: "Pendidikan" },
    { path: "/budaya", label: "Budaya" },
    { path: "/pariwisata", label: "Pariwisata" },
    { path: "/teknologi", label: "Teknologi" },
    { path: "/komunitas", label: "Komunitas" },
    { path: "/sosial", label: "Sosial" },
    { path: "/properti", label: "Properti" },
  ];

  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const handleCategoryClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    router.push(path);
  };

  const searchRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const authMenuRef = useRef<HTMLDivElement | null>(null);
  const authButtonRef = useRef<HTMLButtonElement | null>(null);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setSearchResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        authMenuOpen &&
        authMenuRef.current &&
        !authMenuRef.current.contains(event.target as Node) &&
        authButtonRef.current &&
        !authButtonRef.current.contains(event.target as Node)
      ) {
        setAuthMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [authMenuOpen]);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return `${first}${second}`.toUpperCase() || "U";
  };

  useEffect(() => {
    if (categoryContainerRef.current) {
      const activeCategory = Array.from(
        categoryContainerRef.current.querySelectorAll(".category-pill")
      ).find((element) =>
        (element as HTMLElement).classList.contains("is-active")
      );

      if (activeCategory) {
        categoryContainerRef.current.scrollLeft =
          (activeCategory as HTMLElement).offsetLeft - 100;
      }
    }
  }, [pathname]);

  const loginHref = `/api/auth/google?redirect=${encodeURIComponent(
    pathname || "/"
  )}`;

  return (
    <header className="relative z-50 flex flex-col justify-center md:px-5">
      <div className="mx-auto mt-6 w-full max-w-[1100px] rounded-[28px] border border-white/70 bg-white/70 px-4 py-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display text-2xl font-semibold tracking-tight text-slate-900"
            >
              KabarLokal
            </Link>
          </div>

          <div
            ref={searchRef}
            className="w-full max-w-[520px] relative px-5 md:px-0"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="search-bar rounded-full flex items-center justify-between border border-slate-200 bg-white/80 px-2 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100">
                <FaSearch className="text-hint fa-search ml-3" />
                <input
                  type="text"
                  className="w-full h-11 rounded-full outline-none font-semibold px-2 caret-dark text-base text-slate-600 bg-transparent"
                  placeholder="Cari berita lokal, acara, komunitas..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </form>

            {searchResults.length > 0 && (
              <div
                ref={resultsRef}
                className="absolute left-0 right-0 mx-8 md:mx-0 z-40 bg-white border-slate-200 max-h-[300px] overflow-y-auto shadow-xl rounded-2xl"
              >
                {isLoading ? (
                  <div className="p-4 text-center">Loading...</div>
                ) : (
                  searchResults.map((news) => (
                    <Link
                      key={news._id}
                      href={`/${formatForUrl(news.category)}/${formatForUrl(
                        news.title
                      )}`}
                      className="block p-3 hover:bg-slate-50 transition-colors duration-200"
                    >
                      <div className="flex items-start space-x-1">
                        <div className="flex-1">
                          <h3 className="font-semibold line-clamp-2 text-slate-900">
                            {news.title}
                          </h3>
                          <p className="text-slate-500 text-sm">
                            {news.location.district} - {news.category} -{" "}
                            {new Date(news.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative flex items-center gap-3 lg:mt-0">
            {loading ? (
              <div className="bg-transparent border border-border px-4 py-2 rounded-full font-bold text-slate-600">
                Checking
              </div>
            ) : (
              <>
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      ref={authButtonRef}
                      type="button"
                      onClick={() => setAuthMenuOpen((prev) => !prev)}
                      className="w-11 h-11 rounded-full border border-slate-200 bg-white/90 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center overflow-hidden"
                      aria-label="Menu akun"
                    >
                      {user?.image && user.image.startsWith("http") ? (
                        <img
                          src={user.image}
                          alt={user.name || "Foto profil"}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-slate-700">
                          {getInitials(user?.name)}
                        </span>
                      )}
                    </button>

                    {authMenuOpen && (
                      <div
                        ref={authMenuRef}
                        className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-[70]"
                      >
                        <Link
                          href="/dashboard"
                          className="block rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Dashboard
                        </Link>
                        <button
                          type="button"
                          onClick={() => logout()}
                          disabled={logoutLoading}
                          className="w-full text-left rounded-xl px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {logoutLoading ? "Memproses..." : "Keluar"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={loginHref}
                    aria-label="Masuk dengan Google"
                    className="relative group bg-white/90 border border-slate-200 w-11 h-11 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="w-6 h-6"
                      aria-hidden="true"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.2 0 6.1 1.1 8.3 2.9l6.2-6.2C34.8 2.5 29.7 0 24 0 14.6 0 6.4 5.4 2.5 13.2l7.3 5.7C11.6 13.1 17.3 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.5 24.5c0-1.7-.2-3.3-.6-4.9H24v9.3h12.5c-.6 3-2.3 5.5-4.9 7.2l7.5 5.8c4.4-4.1 7.4-10.2 7.4-17.4z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M9.8 28.9c-.5-1.3-.8-2.8-.8-4.4 0-1.6.3-3.1.8-4.4l-7.3-5.7C.9 17.4 0 20.6 0 24.5s.9 7.1 2.5 10.1l7.3-5.7z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c5.7 0 10.5-1.9 14-5.2l-7.5-5.8c-2.1 1.4-4.8 2.2-6.5 2.2-6.7 0-12.4-3.6-14.2-8.9l-7.3 5.7C6.4 42.6 14.6 48 24 48z"
                      />
                    </svg>
                    <span className="pointer-events-none absolute -bottom-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                      Masuk dengan Google
                    </span>
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative -z-10 max-w-[520px] md:max-w-[820px] lg:max-w-[1100px] mx-auto my-6 px-2 ">
        <div className="rounded-full border border-white/70 bg-white/70 px-2 py-2 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.4)] backdrop-blur">
          <div
            ref={categoryContainerRef}
            className="flex-1 overflow-x-auto custom-scrollbar category-container"
          >
            <div className="flex flex-nowrap whitespace-nowrap items-center gap-2 transition-transform duration-300 ease-in-out px-1">
              {categories.map(({ path, label }) => (
                <a
                  key={path}
                  href={path}
                  onClick={(e) => handleCategoryClick(e, path)}
                  className={`category-pill rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive(path)
                      ? "is-active bg-emerald-100 text-emerald-800 shadow-sm"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../utils/hook/useAuth";
import useFetchNews from "../../../../../utils/hook/useFetchNews";
import { FiCheckCircle, FiLogOut, FiPlus, FiXCircle } from "react-icons/fi";
import SkeletonCards from "../../skeleton/SkeletonCards";
import Cards from "../../Cards";
import useFetchNotif from "../../../../../utils/hook/useFetchNotif";
import { IoMdNotificationsOutline } from "react-icons/io";
import Pagination from "../../Pagination";

const ApprovedUser: React.FC<DashboardProps> = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const { logout, isLoading: loading } = useAuth();
  const profileImageSrc = user?.image?.startsWith("http")
    ? user.image
    : `/images/${user?.image}`;
  const handleLogout = async () => {
    await logout();
  };

  const { newsData, isLoading } = useFetchNews(
    1000,
    "approved",
    "",
    "",
    user?.id,
  );
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(newsData.length / itemsPerPage));
  const pageData = newsData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const { notifications, isLoading: isNotifLoading } = useFetchNotif(user?.id!);

  const notificationCount = notifications?.length || 0;

  useEffect(() => {
    if (dropdownOpen) {
      setNotifOpen(false);
    }
    if (notifOpen) {
      setDropdownOpen(false);
    }
  }, [dropdownOpen, notifOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [newsData.length]);

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
            <a href="/dashboard">User</a>
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
              Arsip berita yang sudah lolos proses review
            </p>
          </div>
          <div className="relative">
            <div className="flex items-center cursor-pointer">
              <span
                className="mr-5 relative"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <IoMdNotificationsOutline className="w-8 h-8 text-slate-600 hover:text-emerald-600 transition-colors duration-200" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2"
              >
                <span className="text-slate-700 font-semibold">
                  {user?.name}
                </span>
                <img
                  src={profileImageSrc}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-white"
                />
              </button>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-6 w-60 rounded-2xl border border-white/70 bg-white/95 shadow-xl z-10">
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
                    <p className="text-xs text-slate-500">User</p>
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
            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/70 bg-white/95 shadow-2xl z-10 overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-white/70 bg-white/80">
                  <div className="flex items-center space-x-3">
                    <IoMdNotificationsOutline className="text-emerald-600 text-xl" />
                    <span className="font-semibold text-slate-800">
                      Notifikasi
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                    {notificationCount} Baru
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className="p-4 hover:bg-emerald-50/70 transition-colors duration-150 flex items-start space-x-3"
                      >
                        {notif.status === "approved" && (
                          <FiCheckCircle className="text-green-500 text-lg mt-1" />
                        )}
                        {notif.status === "pending" && (
                          <FiXCircle className="text-red-500 text-lg mt-1" />
                        )}
                        <div>
                          <p className="text-sm text-slate-700">
                            {notif.message}
                          </p>
                          <span
                            className={`text-xs font-medium ${
                              notif.status === "approved"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {notif.status.charAt(0).toUpperCase() +
                              notif.status.slice(1)}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500">
                      <p>Belum ada notifikasi</p>
                    </div>
                  )}
                </div>
                <div className="p-3 text-center border-t border-white/70 bg-white/80">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.2em]">
                    Semua Notifikasi
                  </p>
                </div>
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
                Daftar berita yang sudah disetujui oleh tim.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-secondary text-emerald-700 px-4 py-2 rounded-full font-semibold uppercase tracking-[0.2em] text-xs">
                approved
              </span>
              <a
                href="/news/create"
                className="bg-emerald-600 text-white px-4 py-2 rounded-full shadow-sm hover:bg-emerald-700 flex items-center space-x-2 text-sm font-semibold"
              >
                <FiPlus className="text-lg" />
                <span>Buat Berita</span>
              </a>
            </div>
          </div>
          {isLoading ? (
            <SkeletonCards />
          ) : (
            <Cards
              data={pageData}
              role={user?.role}
              showActions={true}
              showView={true}
            />
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </div>
  );
};

export default ApprovedUser;

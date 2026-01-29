import { FiLogOut } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../../utils/hook/useAuth";
import useFetchNews from "../../../../../utils/hook/useFetchNews";
import Sidebar from "../../Sidebar";
import BeritaTertunda from "../../BeritaTertunda";

const DashboardAdmin: React.FC<DashboardProps> = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout, isLoading: loading } = useAuth();
  const profileImageSrc = user?.image?.startsWith("http")
    ? user.image
    : `/images/${user?.image}`;
  const handleLogout = async () => {
    await logout();
  };

  const { newsData, isLoading } = useFetchNews(1000, "pending");

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbfa,_#fdf6f1,_#f5f8ff)] text-slate-900">
      <Sidebar userRole="admin" />

      {/* Main Content */}
      <div className="flex-1 ml-0 lg:ml-72 transition-all">
        <header className="mx-4 mt-4 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur lg:mx-8">
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">
              Dashboard Admin
            </p>
            <p className="text-xs text-slate-500">
              Kelola berita dan moderasi konten
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
                    <p className="text-xs text-slate-500">Admin</p>
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

        <BeritaTertunda
          newsData={newsData}
          isLoading={isLoading}
          user={user}
          showApprove={true}
          showDelete={true}
        />
      </div>
    </div>
  );
};

export default DashboardAdmin;

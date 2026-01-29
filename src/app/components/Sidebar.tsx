import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getRoleLabel = () => {
    const roleMap: { [key: string]: string } = {
      admin: "Admin",
      provider: "Provider",
      user: "User",
    };
    return roleMap[userRole] || "User";
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
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

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } border-r border-white/70 bg-white/85 text-slate-700 shadow-xl backdrop-blur transition-transform lg:translate-x-0 z-40`}
      >
        <div className="p-6 relative flex justify-between items-center">
          <h2 className="text-2xl font-display font-semibold text-slate-900">
            <a href="/dashboard">{getRoleLabel()}</a>
          </h2>
          <button
            className="lg:hidden text-slate-500 hover:text-slate-900"
            onClick={handleCloseSidebar}
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
                onClick={handleCloseSidebar}
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
                onClick={handleCloseSidebar}
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
    </>
  );
};

export default Sidebar;

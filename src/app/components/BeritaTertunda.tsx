import { useState } from "react";
import Cards from "./Cards";
import SkeletonCards from "./skeleton/SkeletonCards";
import Pagination from "./Pagination";
import { News } from "../../../types/News";

interface UserData {
  id: string;
  name: string;
  role: string;
  image: string;
}

interface BeritaTertundaProps {
  newsData: News[];
  isLoading: boolean;
  user: UserData | null;
  showUpdate?: boolean;
  showDelete?: boolean;
  showApprove?: boolean;
}

const BeritaTertunda: React.FC<BeritaTertundaProps> = ({
  newsData,
  isLoading,
  user,
  showUpdate = false,
  showDelete = false,
  showApprove = false,
}) => {
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(newsData.length / itemsPerPage));
  const pageData = newsData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <main className="flex-1 px-4 pb-10 pt-6 lg:px-8">
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-slate-900">
            Berita Tertunda
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {user?.role === "admin"
              ? "Tinjau dan setujui berita yang masuk dari kontributor."
              : user?.role === "provider"
                ? "Kurasi berita dari kontributor"
                : "Pantau berita yang sedang menunggu proses persetujuan."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-secondary text-emerald-700 px-4 py-2 rounded-full font-semibold uppercase tracking-[0.2em] text-xs">
            pending
          </span>
        </div>
      </div>
      <div className="mt-6">
        {isLoading ? (
          <SkeletonCards />
        ) : (
          <Cards
            data={pageData}
            role={user?.role}
            showActions={true}
            showView={true}
            showUpdate={showUpdate}
            showDelete={showDelete}
            showApprove={showApprove}
          />
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </main>
  );
};

export default BeritaTertunda;

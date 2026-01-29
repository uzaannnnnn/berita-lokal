type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPageButtons?: number;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPageButtons = 5,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const maxButtons = Math.max(3, maxPageButtons);
  const windowButtons = Math.max(1, maxButtons - 2);
  const halfWindow = Math.floor(windowButtons / 2);
  let startPage = Math.max(2, currentPage - halfWindow);
  let endPage = Math.min(totalPages - 1, startPage + windowButtons - 1);

  if (endPage - startPage + 1 < windowButtons) {
    startPage = Math.max(2, endPage - windowButtons + 1);
  }

  const pages: Array<number | "ellipsis-start" | "ellipsis-end"> = [1];
  if (startPage > 2) {
    pages.push("ellipsis-start");
  }
  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }
  if (endPage < totalPages - 1) {
    pages.push("ellipsis-end");
  }
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
      <span className="text-sm text-slate-500">
        Halaman {currentPage} dari {totalPages}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-emerald-50"
        >
          Prev
        </button>
        {pages.map((page, index) => {
          if (typeof page !== "number") {
            return (
              <span
                key={`${page}-${index}`}
                className="px-2 text-slate-400 text-sm font-semibold"
              >
                ...
              </span>
            );
          }
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-9 w-9 rounded-full text-sm font-semibold transition ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-200 text-slate-600 hover:bg-emerald-50"
              }`}
            >
              {page}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-emerald-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

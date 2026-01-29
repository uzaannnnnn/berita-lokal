"use client";

const SkeletonDashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen animate-pulse bg-[radial-gradient(circle_at_top,_#f8fbfa,_#fdf6f1,_#f5f8ff)]">
      <div className="hidden lg:block w-72">
        <div className="m-4 rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <div className="h-8 bg-slate-200 rounded-lg"></div>
          <div className="mt-6 space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-10 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="mx-4 mt-4 flex h-16 items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 shadow-sm backdrop-blur lg:mx-8">
          <div className="h-8 bg-slate-200 w-32 rounded-lg"></div>
          <div className="flex items-center space-x-4">
            <div className="h-9 w-9 bg-slate-200 rounded-full"></div>
            <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-10 pt-6 lg:px-8 space-y-6">
          <div className="space-y-3">
            <div className="h-8 bg-slate-200 w-1/3 rounded-lg"></div>
            <div className="h-4 bg-slate-200 w-1/2 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-44 bg-slate-200 rounded-2xl shadow-sm"
              ></div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SkeletonDashboard;

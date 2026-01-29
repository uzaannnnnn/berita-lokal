export default function NewsProvider() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbfa,_#fdf6f1,_#f5f8ff)] text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold">
                Tinjau Berita
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Kelola berita dari kontributor sebelum diteruskan ke tahap
                berikutnya.
              </p>
            </div>
            <span className="bg-secondary text-emerald-700 px-4 py-2 rounded-full font-semibold uppercase tracking-[0.2em] text-xs w-fit">
              provider
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-left transition hover:bg-emerald-100">
              <p className="text-sm font-semibold text-emerald-900">
                Perbarui Berita
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Sinkronkan data dan status berita terbaru.
              </p>
            </button>
            <button className="rounded-2xl border border-emerald-100 bg-white px-5 py-4 text-left shadow-sm transition hover:bg-emerald-50">
              <p className="text-sm font-semibold text-slate-800">
                Tambah Berita
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Ajukan berita baru dari panel provider.
              </p>
            </button>
            <button className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-left transition hover:bg-rose-100">
              <p className="text-sm font-semibold text-rose-900">
                Hapus Berita
              </p>
              <p className="mt-1 text-xs text-rose-700">
                Kelola berita yang perlu dihapus atau dibatalkan.
              </p>
            </button>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-5 py-4 text-left">
              <p className="text-sm font-semibold text-slate-800">
                Ringkasan
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Gunakan panel ini sebagai quick actions untuk review berita.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/dashboard"
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50"
            >
              Kembali ke Dashboard
            </a>
            <a
              href="/news/approved"
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Lihat Berita Disetujui
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

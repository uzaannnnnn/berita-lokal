"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../../../utils/hook/useAuth";
import useUserData from "../../../../utils/hook/useUserData";
import useSessionStorage from "../../../../utils/hook/useSessionStorage";
import useUpdateNews from "../../../../utils/hook/useUpdateNews";
import RichTextEditor from "../../vendor/RichTextEditor";
import ImageInput from "../../components/ImageInput";

interface NewsFormData {
  namaKomunitas: string;
  judul: string;
  gambarUrl: string;
  kategori: string;
  konten: string;
}

interface Errors {
  judul?: string;
  gambarUrl?: string;
  namaKomunitas?: string;
}

export default function UpdateNews() {
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [formData, setFormData] = useSessionStorage<NewsFormData>(
    "formDataUpdate",
    {
      namaKomunitas: "",
      judul: "",
      gambarUrl: "",
      kategori: "komunitas",
      konten: "",
    }
  );
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { logout, isLoading: loading } = useAuth();
  const { userData: user } = useUserData();
  const pathname = usePathname();
  const router = useRouter();
  const [imageMode, setImageMode] = useState<"url" | "file">("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const profileImageSrc = user?.image?.startsWith("http")
    ? user.image
    : `/images/${user?.image}`;
  const [newsId, setNewsId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
    }
  }, []);

  useEffect(() => {
    if (searchParams) {
      const idFromParams = searchParams.get("newsId");
      if (idFromParams) {
        localStorage.setItem("newsId", idFromParams);
        setNewsId(idFromParams);

        router.replace("/news/update");
      } else {
        const storedNewsId = localStorage.getItem("newsId");
        setNewsId(storedNewsId);
      }
    }
  }, [searchParams, router]);

  const {
    news,
    fetchNewsById,
    updateNews,
    loading: loadingUpdate,
  } = useUpdateNews();

  useEffect(() => {
    if (newsId && !isFetched) {
      fetchNewsById(newsId!)
        .then(() => setIsFetched(true))
        .catch((err) => console.error("Error fetching news", err));
    }
  }, [newsId, isFetched, fetchNewsById]);

  useEffect(() => {
    if (news) {
      setFormData({
        namaKomunitas: news.category || "",
        judul: news.title,
        gambarUrl: news.image,
        kategori: news.category
          ? news.category.toLowerCase()
          : "peristiwa-lokal",
        konten: news.content,
      });
      setIsLoaded(true);
    }
  }, [news]);

  const handleLogout = async () => {
    await logout();
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRichTextChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      konten: value,
    }));
  };

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    const { judul, gambarUrl, namaKomunitas, kategori } = formData;

    if (!judul) newErrors.judul = "Judul wajib diisi.";
    if (imageMode === "url" && !gambarUrl) {
      newErrors.gambarUrl = "URL gambar wajib diisi.";
    }
    if (imageMode === "file" && !imageFile) {
      newErrors.gambarUrl = "File gambar wajib diisi.";
    }
    if (imageMode === "file" && imageFile) {
      const maxBytes = 5 * 1024 * 1024;
      if (!["image/png", "image/jpeg"].includes(imageFile.type)) {
        newErrors.gambarUrl = "Format file harus PNG atau JPG.";
      }
      if (imageFile.size > maxBytes) {
        newErrors.gambarUrl = "Ukuran file maksimal 5MB.";
      }
    }
    if (kategori === "komunitas" && !namaKomunitas) {
      newErrors.namaKomunitas = "Nama komunitas wajib diisi.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const normalizeImageUrl = (value: string) =>
    value.startsWith("http") ? value : `https://${value}`;

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Upload gambar gagal.");
    }
    const data = await response.json();
    return data.url as string;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({
      judul: true,
      gambarUrl: true,
      namaKomunitas: true,
      konten: true,
    });
    if (!validateForm()) return;

    try {
      let imageUrl = normalizeImageUrl(formData.gambarUrl);
      if (imageMode === "file") {
        if (!imageFile) {
          setErrors((prev) => ({
            ...prev,
            gambarUrl: "File gambar wajib diisi.",
          }));
          return;
        }
        setUploadingImage(true);
        imageUrl = await uploadImage(imageFile);
      }

      await updateNews({
        id: newsId,
        title: formData.judul,
        category: formData.kategori,
        image: imageUrl,
        content: formData.konten,
      });
    } catch (error) {
      console.error("Form submission error", error);
    } finally {
      setUploadingImage(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbfa,_#fdf6f1,_#f5f8ff)] text-slate-900">
      <button
        className="fixed top-4 left-4 z-50 rounded-full border border-white/70 bg-white/80 p-2 shadow-lg backdrop-blur lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
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
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-2xl font-display font-semibold text-slate-900">
            <a href="/dashboard">Dashboard</a>
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
        <nav className="mt-4">
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

      <div className="flex-1 lg:ml-72">
        <header className="mx-4 mt-4 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur lg:mx-8">
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">
              Perbarui Berita
            </p>
            <p className="text-xs text-slate-500">
              Revisi konten dan detail berita.
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
              <div className="absolute right-0 mt-6 w-48 rounded-2xl border border-white/70 bg-white/95 shadow-xl">
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

        <main className="px-4 pb-12 pt-6 lg:px-8">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur"
          >
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Judul<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                onBlur={() => markTouched("judul")}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              {touched.judul && errors.judul && (
                <p className="text-red-600 text-sm mt-1">{errors.judul}</p>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Kategori<span className="text-red-500">*</span>
              </label>
              <select
                name="kategori"
                value={formData.kategori}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-500 cursor-not-allowed"
              >
                <option value="peristiwa-lokal">Peristiwa Lokal</option>
                <option value="komunitas">Komunitas</option>
              </select>
            </div>

            {formData.kategori === "komunitas" && (
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Komunitas<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaKomunitas"
                  value={formData.namaKomunitas}
                  onChange={handleInputChange}
                  onBlur={() => markTouched("namaKomunitas")}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                {touched.namaKomunitas && errors.namaKomunitas && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.namaKomunitas}
                  </p>
                )}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Gambar<span className="text-red-500">*</span>
              </label>
              <ImageInput
                mode={imageMode}
                onModeChange={(mode) => {
                  setImageMode(mode);
                  markTouched("gambarUrl");
                }}
                urlValue={formData.gambarUrl}
                onUrlChange={(value) =>
                  handleInputChange({
                    target: { name: "gambarUrl", value },
                  } as ChangeEvent<HTMLInputElement>)
                }
                onUrlBlur={() => markTouched("gambarUrl")}
                file={imageFile}
                onFileChange={(file) => {
                  setImageFile(file);
                  markTouched("gambarUrl");
                }}
                onFileError={(message) =>
                  setErrors((prev) => ({ ...prev, gambarUrl: message }))
                }
                error={errors.gambarUrl}
                touched={touched.gambarUrl}
                maxSizeMb={5}
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Konten Berita<span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.konten}
                onChange={handleRichTextChange}
              />
            </div>

            <button
              type="submit"
              className={`bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-emerald-700 transition ${
                uploadingImage ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loadingUpdate || uploadingImage}
            >
              {loadingUpdate || uploadingImage ? "Loading..." : "Perbarui"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

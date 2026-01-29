"use client";
import { usePathname } from "next/navigation";
import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import { useAuth } from "../../../../utils/hook/useAuth";
import { FiLogOut } from "react-icons/fi";
import useUserData from "../../../../utils/hook/useUserData";
import useSessionStorage from "../../../../utils/hook/useSessionStorage";
import useSubmitNews from "../../../../utils/hook/useSubmitNews";
import { useRouter } from "next/navigation";
import RichTextEditor from "../../vendor/RichTextEditor";
import ImageInput from "../../components/ImageInput";
import { LokasiType } from "../../../../types/LokasiType";

interface NewsFormData {
  kategori: string;
  namaKomunitas: string;
  judul: string;
  gambarUrl: string;
  kontenBerita: string;
}

interface Errors {
  judul?: string;
  kategori?: string;
  gambarUrl?: string;
  namaKomunitas?: string;
  kontenBerita?: string;
  lokasi?: string;
  tags?: string;
}

export default function CreateNews() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [formData, setFormData] = useSessionStorage<NewsFormData>("formData", {
    kategori: "",
    namaKomunitas: "",
    judul: "",
    gambarUrl: "",
    kontenBerita: "",
  });
  const router = useRouter();
  const [lokasi, setLokasi] = useState<LokasiType | null>(null);
  const [loadingLocation, setLoading] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([""]);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const widthRefs = useRef<HTMLSpanElement[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const pathname = usePathname();
  const { logout, isLoading: loading } = useAuth();
  const { userData: user } = useUserData();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "file">("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const profileImageSrc = user?.image?.startsWith("http")
    ? user.image
    : `/images/${user?.image}`;

  // const API_KEY_OPEN_KAGE = process.env.NEXT_PUBLIC_API_KEY_OPEN_KAGE;

  const { submitNews, loading: loadingSubmit } = useSubmitNews();

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const storedData = sessionStorage.getItem("formData");
    if (storedData) {
      console.log("Data loaded from sessionStorage:", JSON.parse(storedData));
      setFormData(JSON.parse(storedData));
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    const { judul, kategori, gambarUrl, namaKomunitas, kontenBerita } =
      formData;

    const titleWords = judul.split(/\s+/).length;
    const contentWords = kontenBerita.split(/\s+/).length;

    if (titleWords < 4)
      newErrors.judul = "Judul harus terdiri dari minimal 4 kata.";
    if (!kategori) newErrors.kategori = "Kategori harus diisi.";
    if (imageMode === "url") {
      const normalizedUrl = gambarUrl.startsWith("http")
        ? gambarUrl
        : `https://${gambarUrl}`;
      if (!/\.(png|jpg|jpeg)$/i.test(normalizedUrl)) {
        newErrors.gambarUrl =
          "Gambar harus berekstensi .png, .jpg, atau .jpeg.";
      }
    } else if (!imageFile) {
      newErrors.gambarUrl = "Silakan pilih file gambar.";
    } else {
      const maxBytes = 5 * 1024 * 1024;
      if (!["image/png", "image/jpeg"].includes(imageFile.type)) {
        newErrors.gambarUrl = "Format file harus PNG atau JPG.";
      }
      if (imageFile.size > maxBytes) {
        newErrors.gambarUrl = "Ukuran file maksimal 5MB.";
      }
    }
    if (kategori === "Komunitas" && namaKomunitas.length < 3) {
      newErrors.namaKomunitas =
        "Nama komunitas harus terdiri dari minimal 3 karakter.";
    }
    if (contentWords < 10 || contentWords > 1000) {
      newErrors.kontenBerita =
        "Konten berita harus terdiri dari minimal 10 kata dan maksimal 1000 kata.";
    }

    if (!lokasi) {
      newErrors.lokasi = "Lokasi harus diatur sebelum mengirim berita.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [formData, lokasi, imageMode, imageFile]);

  useEffect(() => {
    const storedLocation = localStorage.getItem("lokasi");
    if (storedLocation) {
      setLokasi(JSON.parse(storedLocation));
    }
  }, []);

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
    // If the upload succeeded but the object is not publicly reachable, throw a helpful error
    if (typeof data.accessible !== "undefined" && !data.accessible) {
      throw new Error(
        "File berhasil diunggah ke R2, tetapi belum dapat diakses secara publik. Periksa konfigurasi R2_PUBLIC_URL atau Worker yang men-serve bucket.",
      );
    }

    return data.url as string;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({
      judul: true,
      kategori: true,
      gambarUrl: true,
      namaKomunitas: true,
      kontenBerita: true,
      lokasi: true,
      tags: true,
    });

    const cleanedTags = tags.filter((tag) => tag.trim() !== "");

    try {
      let imageUrl = normalizeImageUrl(formData.gambarUrl);
      if (imageMode === "file") {
        if (!imageFile) {
          setErrors((prev) => ({
            ...prev,
            gambarUrl: "Silakan pilih file gambar.",
          }));
          return;
        }
        setUploadingImage(true);
        imageUrl = await uploadImage(imageFile);
      }

      await submitNews({
        title: formData.judul,
        category: formData.kategori,
        image: imageUrl,
        content: formData.kontenBerita,
        location: lokasi
          ? lokasi
          : { lat: 0, long: 0, district: "", regency: "", country: "" },
        tags: cleanedTags,
      });

      sessionStorage.removeItem("formData");

      setFormData({
        judul: "",
        kontenBerita: "",
        gambarUrl: "",
        kategori: "",
        namaKomunitas: "",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Form submission error", error);
      const alertMessage = sessionStorage.getItem("alertMessage");
      console.log("Alert message from sessionStorage:", alertMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
      kontenBerita: value,
    }));
  };

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleAmbilLokasi = () => {
    markTouched("lokasi");
    setLoading(true);
    setErrorMessage(null);

    const handleError = (message: string) => {
      setErrorMessage(message);
      setLoading(false);
    };

    const fetchLocationData = async (latitude: number, longitude: number) => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18&addressdetails=1`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "PortalBeritaLokal/1.0 muhamadfarhan.inc@gmail.com",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data lokasi.");
        }

        const data = await response.json();
        if (data && data.address) {
          const address = data.address;

          const district =
            address.village ||
            address.town ||
            address.city ||
            address.suburb ||
            "Unknown";

          const regency =
            address.county ||
            address.state_district ||
            address.city ||
            "Unknown";

          const country = address.country || "Unknown";

          const newLocation = {
            lat: latitude,
            long: longitude,
            district,
            regency,
            country,
          };
          setLokasi(newLocation);
          localStorage.setItem("lokasi", JSON.stringify(newLocation));
        } else {
          handleError("Lokasi tidak ditemukan.");
        }
      } catch (error) {
        handleError("Terjadi kesalahan saat mengambil lokasi.");
        console.error("Error fetching location:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!navigator.permissions) {
      handleError("Browser tidak mendukung API Permissions.");
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        if (permissionStatus.state === "denied") {
          handleError(
            "Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser.",
          );
        } else if (["granted", "prompt"].includes(permissionStatus.state)) {
          if (!navigator.geolocation) {
            handleError("Geolocation is not supported by this browser.");
            return;
          }

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await fetchLocationData(latitude, longitude);
            },
            (error) => {
              handleError("Error getting location: " + error.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            },
          );
        }
      });
  };

  const handleTagChange = (index: number, value: string) => {
    if (value.includes(" ")) return;

    const trimmedValue = value.trim();

    if (tags.includes(trimmedValue) && tags.indexOf(trimmedValue) !== index) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        tags: "Tag ini sudah ada, coba tag lain.",
      }));
      return;
    }

    setErrors((prevErrors) => {
      const { tags, ...rest } = prevErrors;
      return rest;
    });

    const newTags = [...tags];
    newTags[index] = trimmedValue;
    setTags(newTags);
  };

  const handleAddTag = (index: number) => {
    if (tags[index] && index === tags.length - 1) {
      setTags([...tags, ""]);
    }
    setTimeout(() => {
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }, 0);
  };

  const handleClearTags = () => {
    setTags([""]);
    inputRefs.current[0]?.focus();
  };

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

      {/* Sidebar */}
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
              Buat Berita
            </p>
            <p className="text-xs text-slate-500">
              Lengkapi detail berita sebelum dikirim.
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
                placeholder="Masukan Judul Berita"
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
                onChange={handleInputChange}
                onBlur={() => markTouched("kategori")}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Pilih Kategori</option>
                <option value="Peristiwa Lokal">Peristiwa Lokal</option>
                <option value="Komunitas">Komunitas</option>
              </select>
              {touched.kategori && errors.kategori && (
                <p className="text-red-600 text-sm mt-1">{errors.kategori}</p>
              )}
            </div>

            <div
              style={{
                display: formData.kategori === "Komunitas" ? "block" : "none",
              }}
            >
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
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="Masukkan Nama Komunitas"
                />
                {touched.namaKomunitas && errors.namaKomunitas && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.namaKomunitas}
                  </p>
                )}
              </div>
            </div>

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
                Isi Berita<span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.kontenBerita}
                onChange={handleRichTextChange}
                onBlur={() => markTouched("kontenBerita")}
              />
              {touched.kontenBerita && errors.kontenBerita && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.kontenBerita}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Lokasi Saat Ini<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {["Latitude", "Longitude", "Kecamatan", "Kota", "Negara"].map(
                  (label, index) => (
                    <div key={index}>
                      <label className="block font-medium text-xs text-slate-500 mb-1">
                        {label}
                      </label>
                      <input
                        type="text"
                        disabled
                        value={
                          label === "Latitude"
                            ? (lokasi?.lat ?? "-")
                            : label === "Longitude"
                              ? (lokasi?.long ?? "-")
                              : label === "Kecamatan"
                                ? (lokasi?.district ?? "-")
                                : label === "Kota"
                                  ? (lokasi?.regency ?? "-")
                                  : label === "Negara"
                                    ? "Indonesia"
                                    : ""
                        }
                        className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500"
                      />
                    </div>
                  ),
                )}
              </div>
              <button
                onClick={handleAmbilLokasi}
                disabled={lokasi !== null}
                className={`bg-emerald-600 text-white px-4 py-2 mt-4 mb-2 rounded-full shadow-sm text-sm font-semibold transition duration-200 ${
                  lokasi
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-200"
                }`}
              >
                {loadingLocation
                  ? "Mengambil lokasi.."
                  : "Ambil Lokasi Saat Ini"}
              </button>
              {touched.lokasi && errors.lokasi && (
                <p className="text-red-600 text-sm">{errors.lokasi}</p>
              )}
              {errorMessage && (
                <p className="text-red-800 text-base">{errorMessage}</p>
              )}
            </div>
            <div className="mb-14">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Tag <span className="text-green-500 text-sm">(Optional)</span>
              </label>
              <div className="flex flex-wrap gap-5">
                {tags.map((tag, index) => (
                  <div key={index} className="relative">
                    <span
                      ref={(el) => {
                        if (el) widthRefs.current[index] = el;
                      }}
                      className="absolute invisible whitespace-pre"
                      style={{ padding: "8px" }}
                    >
                      {tag ||
                        (index === 0 ? "Masukkan tag" : "Masukkan tag lainnya")}
                    </span>
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current[index] = el;
                      }}
                      type="text"
                      disabled={index < tags.length - 1}
                      value={tag}
                      placeholder={
                        index === 0 ? "Masukkan tag" : "Masukkan tag lain"
                      }
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      onBlur={() => markTouched("tags")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag(index);
                        }
                      }}
                      style={{
                        width: `${Math.max(
                          widthRefs.current[index]?.offsetWidth || 140,
                          140,
                        )}px`,
                      }}
                      className={`px-4 py-2 border rounded-full shadow-sm text-slate-700 ${
                        index < tags.length - 1
                          ? "bg-slate-200 border-slate-300"
                          : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
              {touched.tags && errors.tags && (
                <p className="text-red-600 text-sm mt-1">{errors.tags}</p>
              )}
              <button
                onClick={handleClearTags}
                className="bg-rose-600 text-white px-4 py-2 mt-4 rounded-full shadow-sm text-sm font-semibold hover:bg-rose-700 focus:ring-2 focus:ring-rose-200 transition duration-200"
              >
                Clear Tags
              </button>
            </div>

            <button
              type="submit"
              className={`w-full bg-emerald-600 text-white py-3 rounded-2xl text-sm font-semibold hover:bg-emerald-700 transition duration-200 ${
                !isFormValid || uploadingImage
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={!isFormValid || loadingSubmit || uploadingImage}
            >
              {loadingSubmit || uploadingImage ? "Menyimpan..." : "Buat Berita"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

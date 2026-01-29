import { useEffect, useMemo, useState } from "react";

type ImageInputProps = {
  mode: "url" | "file";
  onModeChange: (mode: "url" | "file") => void;
  urlValue: string;
  onUrlChange: (value: string) => void;
  onUrlBlur?: () => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onFileError?: (message: string) => void;
  error?: string;
  touched?: boolean;
  accept?: string;
  maxSizeMb?: number;
};

const ImageInput: React.FC<ImageInputProps> = ({
  mode,
  onModeChange,
  urlValue,
  onUrlChange,
  onUrlBlur,
  file,
  onFileChange,
  onFileError,
  error,
  touched,
  accept = "image/png,image/jpeg",
  maxSizeMb = 5,
}) => {
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setFilePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const urlPreview = useMemo(() => {
    if (!urlValue) return null;
    if (urlValue.startsWith("http")) return urlValue;
    return `https://${urlValue}`;
  }, [urlValue]);

  const handleFileChange = (fileValue: File | null) => {
    if (!fileValue) {
      onFileChange(null);
      return;
    }
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (fileValue.size > maxBytes) {
      onFileChange(null);
      onFileError?.(`Ukuran file maksimal ${maxSizeMb}MB.`);
      return;
    }
    if (!["image/png", "image/jpeg"].includes(fileValue.type)) {
      onFileChange(null);
      onFileError?.("Format file harus PNG atau JPG.");
      return;
    }
    onFileChange(fileValue);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => onModeChange("url")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            mode === "url"
              ? "bg-emerald-600 text-white"
              : "border border-slate-200 text-slate-500 hover:bg-emerald-50"
          }`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => onModeChange("file")}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            mode === "file"
              ? "bg-emerald-600 text-white"
              : "border border-slate-200 text-slate-500 hover:bg-emerald-50"
          }`}
        >
          Upload
        </button>
      </div>

      {mode === "url" ? (
        <input
          type="text"
          value={urlValue}
          onChange={(event) => onUrlChange(event.target.value)}
          onBlur={onUrlBlur}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="https://gambar-online.com/gambar-berita.png"
        />
      ) : (
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept={accept}
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null)
            }
            className="text-sm text-slate-500"
          />
          <p className="text-xs text-slate-500">
            Format: JPG/PNG. Maks {maxSizeMb}MB.
          </p>
        </div>
      )}

      {touched && error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}

      <div className="mt-3">
        {mode === "url" && urlPreview && (
          <img
            src={urlPreview}
            alt="Preview"
            className="h-32 w-full rounded-2xl object-cover border border-slate-200"
          />
        )}
        {mode === "file" && filePreviewUrl && (
          <img
            src={filePreviewUrl}
            alt="Preview"
            className="h-32 w-full rounded-2xl object-cover border border-slate-200"
          />
        )}
      </div>
    </div>
  );
};

export default ImageInput;

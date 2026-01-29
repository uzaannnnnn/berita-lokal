import { randomUUID } from "crypto";

export const runtime = "nodejs";

const sanitizeFilename = (filename: string) =>
  filename.replace(/[^a-zA-Z0-9._-]/g, "_");

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "File tidak ditemukan." }, { status: 400 });
  }

  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  const uploadToken = process.env.R2_UPLOAD_TOKEN; // Bearer token for Worker

  if (!bucket || !publicUrl || !uploadToken) {
    return Response.json(
      {
        error:
          "Konfigurasi upload belum lengkap. Pastikan R2_BUCKET, R2_PUBLIC_URL, dan R2_UPLOAD_TOKEN diset.",
      },
      { status: 500 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const safeName = sanitizeFilename(file.name || "image");
  const key = `news/${Date.now()}-${randomUUID()}-${safeName}`;

  // Send the file to the Cloudflare Worker upload endpoint via PUT
  const workerUploadBase = publicUrl.replace(/\/$/, "");
  const uploadUrl = `${workerUploadBase}/upload/${key}`;

  try {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${uploadToken}`,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: buffer,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Worker upload failed:", res.status, body);
      return Response.json(
        {
          error: "Upload ke Worker gagal.",
          status: res.status,
          providerMessage: body,
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Worker upload error:", err);
    return Response.json(
      { error: "Upload gagal.", providerMessage: err?.message || String(err) },
      { status: 500 }
    );
  }

  // Build public URL (use provided R2_PUBLIC_URL when available)
  const publicBase = publicUrl.replace(/\/$/, "");
  const url = `${publicBase}/${key}`;

  // Worker accepted the upload (res.ok). Many Worker setups do not respond to HEAD,
  // so assume the object is accessible via the public URL after successful PUT.
  const accessible = true;

  return Response.json({ url, accessible });
}

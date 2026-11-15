// Shrinks big photos in the browser before upload (max 2560px, WebP),
// which keeps pages fast and stays under Vercel's 4.5 MB request limit.

const MAX_SIDE = 2560;
const MAX_BYTES = 4 * 1024 * 1024;

async function shrink(file: File): Promise<File> {
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= MAX_BYTES && file.type === "image/webp") return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.9, 0.8, 0.7, 0.6]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
    if (blob && blob.size <= MAX_BYTES) {
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
    }
  }
  throw new Error("This image is too large even after resizing.");
}

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

/** True for a stored media URL that should play as a looping video. */
export const isVideo = (src: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);

/**
 * Videos are too big for a normal request, so on Vercel they go straight from the
 * browser to Vercel Blob (/api/upload hands out a short-lived upload URL).
 * Locally, without a Blob store, they're sent like images and saved in public/uploads.
 */
async function uploadVideo(file: File): Promise<string> {
  if (file.size > MAX_VIDEO_BYTES) throw new Error("Video is too large (max 50 MB). Try a shorter or smaller clip.");
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const probe = await fetch("/api/upload?direct=1");
  if (probe.ok && (await probe.json()).direct) {
    const { uploadPresigned } = await import("@vercel/blob/client");
    const blob = await uploadPresigned(name, file, { access: "public", handleUploadUrl: "/api/upload", contentType: file.type });
    return blob.url;
  }
  return sendForm(file);
}

async function sendForm(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Upload failed.");
  return body.url as string;
}

export async function uploadImage(file: File): Promise<string> {
  if (file.type.startsWith("video/")) return uploadVideo(file);
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image or video file.");
  return sendForm(await shrink(file));
}

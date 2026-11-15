import { NextResponse } from "next/server";
import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { isAuthed } from "@/lib/auth";
import { blobEnabled, saveImage } from "@/lib/store";

const MAX_BYTES = 4.4 * 1024 * 1024; // Vercel's request limit is 4.5 MB; the editor shrinks images before sending.
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];

/** Tells the editor whether videos can go straight to Vercel Blob. */
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "Please log in again at /edit." }, { status: 401 });
  return NextResponse.json({ direct: blobEnabled() });
}

export async function POST(req: Request) {
  // Direct-to-Blob video upload: the browser asks for a short-lived upload URL.
  if (req.headers.get("content-type")?.includes("application/json")) {
    if (!blobEnabled()) return NextResponse.json({ error: "Storage isn't set up." }, { status: 400 });
    const body = (await req.json()) as HandleUploadPresignedBody;
    if (body.type !== "blob.upload-completed" && !(await isAuthed()))
      return NextResponse.json({ error: "Please log in again at /edit." }, { status: 401 });
    try {
      const result = await handleUploadPresigned({
        body,
        request: req,
        getSignedToken: async (pathname) => {
          if (!pathname.startsWith("uploads/")) throw new Error("Invalid upload path.");
          return {
            token: await issueSignedToken({
              pathname,
              operations: ["put"],
              allowedContentTypes: VIDEO_TYPES,
              maximumSizeInBytes: MAX_VIDEO_BYTES,
              validUntil: Date.now() + 10 * 60 * 1000,
            }),
          };
        },
      });
      return NextResponse.json(result);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }

  if (!(await isAuthed())) return NextResponse.json({ error: "Please log in again at /edit." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  const video = VIDEO_TYPES.includes(file.type);
  if (!file.type.startsWith("image/") && !video)
    return NextResponse.json({ error: "Only images and videos can be uploaded." }, { status: 400 });
  if (file.size > (video ? MAX_VIDEO_BYTES : MAX_BYTES))
    return NextResponse.json({ error: video ? "Video is too large (max 50 MB)." : "Image is too large (max 4 MB after resizing)." }, { status: 413 });
  try {
    return NextResponse.json({ url: await saveImage(file) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

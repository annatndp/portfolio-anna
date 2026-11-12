import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { saveImage } from "@/lib/store";

const MAX_BYTES = 4.4 * 1024 * 1024; // Vercel's request limit is 4.5 MB; the editor shrinks images before sending.

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Please log in again at /edit." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images can be uploaded." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image is too large (max 4 MB after resizing)." }, { status: 413 });
  try {
    return NextResponse.json({ url: await saveImage(file) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

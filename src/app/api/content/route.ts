import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { saveContent } from "@/lib/store";
import type { Content } from "@/content/types";

function looksValid(c: unknown): c is Content {
  if (!c || typeof c !== "object") return false;
  const { site, projects } = c as Content;
  return (
    !!site &&
    typeof site.name === "string" &&
    Array.isArray(projects) &&
    projects.every((p) => typeof p.slug === "string" && p.slug.length > 0) &&
    new Set(projects.map((p) => p.slug)).size === projects.length
  );
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Please log in again at /edit." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!looksValid(body)) return NextResponse.json({ error: "Content is invalid (check project links are unique)." }, { status: 400 });
  try {
    await saveContent(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

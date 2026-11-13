import { promises as fs } from "fs";
import path from "path";
import { head, put } from "@vercel/blob";
import { revalidateTag, unstable_cache } from "next/cache";
import { defaultContent } from "@/content/defaults";
import type { Content } from "@/content/types";

// Where edits are stored:
// - On Vercel (BLOB_READ_WRITE_TOKEN set): Vercel Blob.
// - Locally without the token: .data/content.json and public/uploads/.
const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const BLOB_KEY = "content/content.json";
const LOCAL_FILE = path.join(process.cwd(), ".data", "content.json");
const LOCAL_UPLOADS = path.join(process.cwd(), "public", "uploads");

async function readStored(): Promise<Partial<Content> | null> {
  try {
    if (blobEnabled()) {
      const meta = await head(BLOB_KEY).catch(() => null);
      if (!meta) return null;
      // The version query skips the CDN copy of an older save.
      const res = await fetch(`${meta.url}?v=${new Date(meta.uploadedAt).getTime()}`, { cache: "no-store" });
      return res.ok ? await res.json() : null;
    }
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8"));
  } catch {
    return null;
  }
}

/** Fill in anything missing from stored content with the defaults. */
function normalize(stored: Partial<Content> | null): Content {
  if (!stored) return defaultContent;
  const d = defaultContent;
  const site = { ...d.site, ...stored.site };
  site.about = { ...d.site.about, ...stored.site?.about };
  const projects = (stored.projects ?? d.projects).map((p) => ({ ...d.projects[0], ...p }));
  return { site, projects, no: stored.no ?? d.no };
}

export const getContent = unstable_cache(async () => normalize(await readStored()), ["site-content"], {
  tags: ["content"],
});

export async function saveContent(content: Content) {
  const json = JSON.stringify(content, null, 2);
  if (blobEnabled()) {
    await put(BLOB_KEY, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
  } else {
    if (process.env.VERCEL) throw new Error("Storage isn't set up: connect a Vercel Blob store to this project.");
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, json);
  }
  revalidateTag("content");
}

export async function saveImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  if (blobEnabled()) {
    const blob = await put(`uploads/${name}`, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.VERCEL) throw new Error("Storage isn't set up: connect a Vercel Blob store to this project.");
  await fs.mkdir(LOCAL_UPLOADS, { recursive: true });
  await fs.writeFile(path.join(LOCAL_UPLOADS, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

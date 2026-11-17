import type { FrameSize } from "@/content/types";

/** One block in the gallery row: an image with the texts stuck above / under it, or a free text block.
 * s..e = the gallery indices it covers (texts above, the image, texts under). */
export type GalleryUnit =
  | { kind: "image"; s: number; e: number; img: number; above: number[]; below: number[] }
  | { kind: "text"; s: number; e: number; text: number };

/** Group gallery items into blocks. A text with a = 1 sticks to the next image (texts above can stack),
 * a = -1 to the image before it. A text whose image isn't there is shown as a free text block. */
export function groupGallery(frames: (FrameSize | null | undefined)[], length: number): GalleryUnit[] {
  const units: GalleryUnit[] = [];
  let pending: number[] = [];
  const flush = () => {
    for (const g of pending) units.push({ kind: "text", s: g, e: g, text: g });
    pending = [];
  };
  for (let g = 0; g < length; g++) {
    const fr = frames[g];
    if (!fr?.t) {
      units.push({ kind: "image", s: pending[0] ?? g, e: g, img: g, above: pending, below: [] });
      pending = [];
      continue;
    }
    if (fr.a === 1) {
      pending.push(g);
      continue;
    }
    const last = units[units.length - 1];
    if (fr.a === -1 && !pending.length && last?.kind === "image" && last.e === g - 1) {
      last.below.push(g);
      last.e = g;
      continue;
    }
    flush();
    units.push({ kind: "text", s: g, e: g, text: g });
  }
  flush();
  return units;
}

/** Clean up after a move or delete: texts that lost their image become free text blocks,
 * and "same height as the image beside it" only stays on an image right after another image. */
export function tidyFrames(frames: (FrameSize | null)[], length: number) {
  for (const u of groupGallery(frames, length)) {
    if (u.kind === "text" && frames[u.text]?.a) frames[u.text] = { ...frames[u.text], a: undefined };
  }
  for (let g = 0; g < length; g++) {
    const fr = frames[g];
    if (fr?.m && (g === 0 || frames[g - 1]?.t || fr.t)) frames[g] = { ...fr, m: undefined };
  }
}

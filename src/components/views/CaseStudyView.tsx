"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { emptyImage } from "@/content/defaults";
import { AddButton, EditableImage, T, remapTranslations } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";
import { moveOrder, startPointerDrag } from "@/components/edit/drag";
import { useRef, useState } from "react";
import { DEFAULT_GAP, DEFAULT_RATIO, ResizableFrame, framePx, frameWidth } from "@/components/edit/Frame";
import { LookTools, btn as lookBtn, keep, lookStyle } from "@/components/edit/TextLook";
import type { FrameSize, TextLook } from "@/content/types";
import { slugify } from "@/lib/path";
import { RichT } from "@/components/edit/RichText";
import { groupGallery, tidyFrames, type GalleryUnit } from "@/lib/gallery";

const toolBtn = "rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-ink shadow hover:bg-ink hover:text-paper";
const handleBtn = `${toolBtn} cursor-grab touch-none active:cursor-grabbing`;
/** Default space in px between a text stuck to an image and the image. */
const CAPTION_GAP = 12;
const imgSizes = "(min-width: 1280px) 1280px, 100vw";

export function CaseStudyView({ slug }: { slug: string }) {
  const { content, editing, update, set, ui } = useContent();
  const router = useRouter();
  const galleryRef = useRef<HTMLDivElement>(null);
  /** Gallery items being dragged (s..e) and where they would land. */
  const [drag, setDrag] = useState<{ s: number; e: number } | null>(null);
  const [drop, setDrop] = useState<{ at: number; a?: 1 | -1; bar: React.CSSProperties } | null>(null);
  const i = content.projects.findIndex((p) => p.slug === slug);
  const project = content.projects[i];

  if (!project) {
    return (
      <section className="flex min-h-[70svh] flex-col items-center justify-center px-4 text-center">
        <p className="font-serif text-6xl italic">{ui("projectNotFound")}</p>
        <Link href="/#projects" className="mt-6 underline underline-offset-4">{ui("allProjects")}</Link>
      </section>
    );
  }

  const base = `projects.${i}`;
  const meta = (["category", "campaign", "year"] as const).filter((k) => editing || project[k]);

  const looks = project.looks ?? {};
  const setLook = (key: string) => (next: TextLook | undefined) =>
    update((d) => {
      const all = { ...d.projects[i].looks };
      if (next) all[key] = next;
      else delete all[key];
      d.projects[i].looks = all;
    });
  const setGalleryFrame = (g: number) => (next: FrameSize | null) =>
    update((d) => {
      const p = d.projects[i];
      const frames = Array.from({ length: p.gallery.length }, (_, n) => p.galleryFrames?.[n] ?? null);
      frames[g] = next;
      p.galleryFrames = frames;
    });

  /** Spacing of text g (remembered for new texts), or of every text in the project (g = null). */
  const setTextSpacing = (g: number | null, sp: FrameSize["sp"]) =>
    update((d) => {
      const p = d.projects[i];
      const frames = framesOf(p);
      frames.forEach((fr, n) => {
        if (fr?.t && (g == null || n === g)) frames[n] = { ...fr, sp };
      });
      p.galleryFrames = frames;
      p.textSp = sp;
    });

  const gapX = project.gapX ?? DEFAULT_GAP;
  const gapY = project.gapY ?? DEFAULT_GAP;

  const framesOf = (p: (typeof content.projects)[number]) =>
    Array.from({ length: p.gallery.length }, (_, n) => p.galleryFrames?.[n] ?? null);
  const units = groupGallery(project.galleryFrames ?? [], project.gallery.length);
  const listPath = `${base}.gallery`;
  // Which row each block lands in (widths are shares of the row), so "Full row" texts can go above / under their row.
  const rowFirst: number[] = [];
  const rowLast: number[] = [];
  {
    let start = 0;
    let sum = 0;
    units.forEach((u, n) => {
      const w = Math.min(project.galleryFrames?.[u.kind === "image" ? u.img : u.text]?.w ?? 50, 100);
      if (sum > 0 && sum + w > 100.01) {
        for (let k = start; k < n; k++) rowLast[k] = n - 1;
        start = n;
        sum = 0;
      }
      rowFirst[n] = start;
      sum += w;
    });
    for (let k = start; k < units.length; k++) rowLast[k] = units.length - 1;
  }

  /** Put image g and the next image in one row, same height, keeping image g's width when it leaves room. */
  const sideBySide = (g: number, next: number) =>
    update((d) => {
      const p = d.projects[i];
      const frames = framesOf(p);
      const a = frames[g] ?? {};
      const w1 = a.w && a.w <= 80 ? a.w : 50;
      const w2 = Math.round((100 - w1) * 100) / 100;
      const r1 = a.r ?? DEFAULT_RATIO;
      const row = galleryRef.current?.clientWidth ?? 1200;
      const r2 = Math.round(((framePx(w1, row, gapX) * r1) / framePx(w2, row, gapX)) * 1000) / 1000;
      frames[g] = { ...a, w: w1, r: r1, m: undefined };
      // "Same height" stretching only works for direct neighbours; with texts between, the ratio keeps them level.
      frames[next] = { ...frames[next], w: w2, r: r2, m: next === g + 1 ? true : undefined };
      p.galleryFrames = frames;
    });

  /** Switch an image between the whole row and half a row. A pair it was part of comes apart. */
  const toggleFull = (g: number) =>
    update((d) => {
      const p = d.projects[i];
      const frames = framesOf(p);
      const full = (frames[g]?.w ?? 50) >= 100;
      frames[g] = { ...frames[g], w: full ? undefined : 100, m: undefined };
      if (frames[g + 1]?.m) frames[g + 1] = { ...frames[g + 1], m: undefined };
      p.galleryFrames = frames;
    });

  const removeItem = (g: number) =>
    update((d) => {
      const p = d.projects[i];
      const frames = framesOf(p);
      // Texts stuck to a removed image stay, as free text blocks.
      if (!frames[g]?.t) {
        const u = groupGallery(frames, frames.length).find((x) => x.kind === "image" && x.img === g);
        if (u?.kind === "image") for (const t of [...u.above, ...u.below]) frames[t] = { ...frames[t], a: undefined };
      }
      p.gallery.splice(g, 1);
      frames.splice(g, 1);
      tidyFrames(frames, p.gallery.length);
      p.galleryFrames = frames;
      remapTranslations(d, listPath, (n) => (n === g ? null : n > g ? n - 1 : n));
    });

  /** Add text blocks at the end of the gallery: one across the row, or two side by side. */
  const addText = (columns: 1 | 2) =>
    update((d) => {
      const p = d.projects[i];
      const frames = framesOf(p);
      for (let n = 0; n < columns; n++) {
        p.gallery.push("");
        frames.push({ t: true, ...(columns === 1 && { w: 100 }), ...(p.textSp && { sp: p.textSp }) });
      }
      p.galleryFrames = frames;
    });

  /** Add a text stuck above (1) or under (-1) an image. */
  const addCaption = (u: Extract<GalleryUnit, { kind: "image" }>, side: 1 | -1) =>
    update((d) => {
      const p = d.projects[i];
      const frames = framesOf(p);
      const at = side === 1 ? u.s : u.e + 1;
      p.gallery.splice(at, 0, "");
      frames.splice(at, 0, { t: true, a: side, ...(p.textSp && { sp: p.textSp }) });
      p.galleryFrames = frames;
      remapTranslations(d, listPath, (n) => (n >= at ? n + 1 : n));
    });

  /** Where dragged items would land for a pointer at x, y (null = not over the gallery). */
  function dropAt(x: number, y: number, text: boolean) {
    const root = galleryRef.current;
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-gi]");
    if (!root || !el || !root.contains(el)) return null;
    const unit = el.closest<HTMLElement>("[data-unit]") ?? el;
    const rr = root.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const ur = unit.getBoundingClientRect();
    const g = Number(el.dataset.gi);
    const space = (v: number) => Math.min(Math.max(v, 8), 24) / 2 + 2;
    const hbar = (b: DOMRect, top: boolean, gap: number): React.CSSProperties => ({
      left: b.left - rr.left,
      width: b.width,
      top: (top ? b.top - space(gap) : b.bottom + space(gap) - 4) - rr.top,
      height: 4,
    });
    const vbar = (b: DOMRect, left: boolean): React.CSSProperties => ({
      top: b.top - rr.top,
      height: b.height,
      left: (left ? b.left - space(gapX) : b.right + space(gapX) - 4) - rr.left,
      width: 4,
    });

    if (text && el.dataset.kind === "img") {
      // Top or bottom part of an image: stick the text to it.
      const fy = (y - r.top) / r.height;
      if (fy < 0.3) return { at: g, a: 1 as const, bar: hbar(r, true, 12) };
      if (fy > 0.7) return { at: g + 1, a: -1 as const, bar: hbar(r, false, 12) };
    }
    if (text && el.dataset.kind === "cap") {
      const top = y < r.top + r.height / 2;
      return { at: top ? g : g + 1, a: Number(el.dataset.side) as 1 | -1, bar: hbar(r, top, 12) };
    }
    // Before or after the whole block. Wide blocks go above / below, narrow ones left / right.
    const us = Number(unit.dataset.us);
    const ue = Number(unit.dataset.ue);
    const wide = ur.width > rr.width * 0.7;
    const before = wide ? y < ur.top + ur.height / 2 : x < ur.left + ur.width / 2;
    return { at: before ? us : ue + 1, a: undefined, bar: wide ? hbar(ur, before, gapY) : vbar(ur, before) };
  }

  /** Drag gallery items s..e (an image with its texts, or one text). */
  function startDrag(ev: React.PointerEvent, s: number, e: number) {
    const text = s === e && !!project.galleryFrames?.[s]?.t;
    let target: ReturnType<typeof dropAt> = null;
    setDrag({ s, e });
    startPointerDrag(ev, {
      onMove(x, y) {
        const next = dropAt(x, y, text);
        if (next) {
          target = next;
          setDrop(next);
        }
      },
      onEnd(cancelled) {
        setDrag(null);
        setDrop(null);
        if (cancelled || !target) return;
        const { at, a } = target;
        update((d) => {
          const p = d.projects[i];
          const n = p.gallery.length;
          let frames = framesOf(p);
          const order = moveOrder(n, s, e, at);
          if (order) {
            p.gallery = order.map((o) => p.gallery[o]);
            frames = order.map((o) => frames[o]);
            remapTranslations(d, listPath, (o) => order.indexOf(o));
          }
          const pos = order ? order.indexOf(s) : s;
          if (text) frames[pos] = { ...frames[pos], a };
          else if (order) {
            // A moved image no longer has the partner it was matched to.
            const img = order.indexOf(e);
            for (let k = pos; k <= img; k++) if (!frames[k]?.t && frames[k]?.m) frames[k] = { ...frames[k], m: undefined };
          }
          tidyFrames(frames, n);
          p.galleryFrames = frames;
        });
      },
    });
  }

  const dragging = (g: number) => (drag && g >= drag.s && g <= drag.e ? "opacity-40" : "");
  const moveHandle = (s: number, e: number, cls: string) => (
    <button
      type="button"
      title="Drag to move"
      className={cls}
      onMouseDown={keep}
      onClick={(ev) => ev.preventDefault()}
      onPointerDown={(ev) => startDrag(ev, s, e)}
    >
      ✥
    </button>
  );

  /** A text block in the gallery: free (kind "text") or stuck to an image (kind "cap", side 1 = above, -1 = under). */
  /** A text block. top = it is its own item in the gallery row (free text, or a text across the whole row):
   * o = its place in the row order on larger screens, s..e = the block it belongs to (for drag and drop). */
  const textBlock = (g: number, side?: 1 | -1, top?: { o: number; s: number; e: number }) => {
    const fr = project.galleryFrames?.[g] ?? { t: true };
    const full = (fr.w ?? 50) >= 100;
    const free = side == null;
    // Space above / under the text. Stuck texts start with a small gap on the image side.
    const pt = fr.pt ?? (side === -1 ? (fr.g ?? CAPTION_GAP) : 0);
    const pb = fr.pb ?? (side === 1 ? (fr.g ?? CAPTION_GAP) : 0);
    const space = { marginTop: pt, marginBottom: pb };
    const putSpace = (k: "pt" | "pb", v: number) => setGalleryFrame(g)({ ...fr, pt, pb, g: undefined, [k]: v });
    const spaceSlider = (k: "pt" | "pb", v: number) => (
      <label
        key={k}
        title={k === "pt" ? "Space above this text" : "Space under this text"}
        className="flex items-center gap-1 px-1 text-ink/70"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {k === "pt" ? "↑" : "↓"}
        <input
          type="range"
          min={0}
          max={160}
          step={2}
          value={v}
          onChange={(e) => putSpace(k, Number(e.target.value))}
          className="w-16 accent-[var(--accent)]"
        />
        <span className="w-9 tabular-nums">{v}px</span>
      </label>
    );
    return (
      <div
        key={g}
        data-gi={g}
        data-kind={free ? "text" : "cap"}
        {...(top && { "data-unit": 1, "data-us": top.s, "data-ue": top.e })}
        {...(!free && { "data-side": side })}
        className={`${top ? "w-full shrink-0 sm:order-[var(--o)]" : ""} ${free ? "sm:w-[var(--fw)]" : ""} ${dragging(g)}`}
        style={{
          ...space,
          ...(top && { ["--o" as string]: top.o }),
          ...(free && { ["--fw" as string]: frameWidth(fr.w ?? 50, gapX) }),
        }}
      >
        <LookTools
          look={fr.l}
          onChange={(l) => setGalleryFrame(g)({ ...fr, l })}
          defaultWeight={400}
          width={false}
          weight={false}
          extra={
            <>
              {spaceSlider("pt", pt)}
              {spaceSlider("pb", pb)}
              {moveHandle(g, g, `${lookBtn} cursor-grab touch-none active:cursor-grabbing`)}
              {!free && (
                <button
                  type="button"
                  title={full ? "Make this text as wide as its image" : "Make this text as wide as the whole row of images"}
                  className={lookBtn}
                  onMouseDown={keep}
                  onClick={() => setGalleryFrame(g)({ ...fr, w: full ? undefined : 100 })}
                >
                  {full ? "◧ Image width" : "▭ Full row"}
                </button>
              )}
              {free && (
                <button
                  type="button"
                  title={full ? "Make this text half a row, so another text or image fits beside it" : "Make this text take the whole row"}
                  className={lookBtn}
                  onMouseDown={keep}
                  onClick={() => toggleFull(g)}
                >
                  {full ? "◧ Half" : "▭ Full"}
                </button>
              )}
              <button type="button" title="Remove this text" className={lookBtn} onMouseDown={keep} onClick={() => removeItem(g)}>
                ✕
              </button>
            </>
          }
        >
          <RichT
            path={`${base}.gallery.${g}`}
            floating
            style={lookStyle(fr.l)}
            textStyle={fr.sp}
            onTextStyle={(sp) => setTextSpacing(g, sp)}
            onTextStyleAll={() => setTextSpacing(null, fr.sp)}
            className={
              free
                ? "block min-h-[1.5em] text-[length:calc(var(--s,1)*1.125rem)] leading-relaxed text-gray sm:text-[length:calc(var(--s,1)*1.25rem)]"
                : "block min-h-[1.5em] text-[length:calc(var(--s,1)*0.95rem)] leading-relaxed text-gray sm:text-[length:calc(var(--s,1)*1rem)]"
            }
            placeholder={side === 1 ? "Text above the image…" : side === -1 ? "Text under the image…" : "Write something…"}
          />
        </LookTools>
      </div>
    );
  };

  function changeSlug() {
    const input = prompt("Page link (letters, numbers and dashes):", project.slug);
    if (!input) return;
    const next = slugify(input);
    if (next === project.slug) return;
    if (content.projects.some((p) => p.slug === next)) return alert("Another project already uses that link.");
    set(`${base}.slug`, next);
    router.replace(`/projects/${next}`);
  }

  return (
    <article className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-10 sm:pt-32" style={{ ["--gx" as string]: `${gapX}px` }}>
      <Link href="/#projects" className="mb-8 inline-flex items-center gap-2 text-sm text-gray transition-colors hover:text-ink">
        <span aria-hidden>←</span>
        <span className="font-serif italic">{ui("allProjects")}</span>
      </Link>

      {editing && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-ink/25 p-3 text-sm text-gray">
          <span>Link: /projects/{project.slug}</span>
          <button type="button" onClick={changeSlug} className="rounded-full border border-ink/30 px-3 py-1 hover:bg-ink hover:text-paper">
            Change link
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>Spacing</span>
            {(
              [
                ["gapX", gapX, "↔", "Space between images side by side"],
                ["gapY", gapY, "↕", "Space between rows (and under the big image)"],
              ] as const
            ).map(([key, val, icon, hint]) => (
              <label key={key} title={hint} className="flex items-center gap-2">
                <span className="text-base text-ink">{icon}</span>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={4}
                  value={val}
                  onChange={(e) => set(`${base}.${key}`, Number(e.target.value))}
                  className="w-24 accent-[var(--accent)]"
                />
                <span className="w-10 tabular-nums">{val}px</span>
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2">
            Background
            <input
              type="color"
              value={project.tint}
              onChange={(e) => set(`${base}.tint`, e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-ink/20"
            />
          </label>
        </div>
      )}

      {meta.length > 0 && (
        <LookTools look={looks.meta} onChange={setLook("meta")} defaultWeight={600}>
          <p
            className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[length:calc(var(--s,1)*0.75rem)] font-semibold uppercase leading-snug tracking-widest text-gray"
            style={lookStyle(looks.meta)}
          >
            <span className="h-2.5 w-2.5 rounded-full border-2 border-accent" aria-hidden />
            {meta.map((k, n) => (
              <span key={k} className={n > 0 && !looks.meta?.c ? "opacity-70" : ""}>
                {n > 0 && "· "}
                <T path={`${base}.${k}`} placeholder={k} />
              </span>
            ))}
          </p>
        </LookTools>
      )}

      <LookTools look={looks.title} onChange={setLook("title")} defaultWeight={600}>
        <T
          path={`${base}.title`}
          as="h1"
          style={lookStyle(looks.title)}
          className="block max-w-4xl sm:w-[var(--tw,auto)] text-[length:calc(var(--s,1)*3rem)] font-semibold leading-[1.05] tracking-tight sm:text-[length:calc(var(--s,1)*4.5rem)]"
          placeholder="Project title"
        />
      </LookTools>
      <div className="mt-5">
        <LookTools look={looks.description} onChange={setLook("description")} defaultWeight={400}>
          <T
            path={`${base}.description`}
            as="p"
            multiline
            style={lookStyle(looks.description)}
            className="block max-w-2xl sm:w-[var(--tw,auto)] text-[length:calc(var(--s,1)*1.125rem)] leading-relaxed text-gray sm:text-[length:calc(var(--s,1)*1.25rem)]"
            placeholder="Describe the project"
          />
        </LookTools>
      </div>

      <div className="mt-10 flex justify-center" style={{ marginBottom: gapY }}>
        <ResizableFrame size={project.coverFrame} onResize={(f) => set(`${base}.coverFrame`, f ?? undefined)} background={project.tint}>
          <EditableImage path={`${base}.cover`} alt={project.title} sizes={imgSizes} priority className={project.coverFrame?.f === false ? "object-contain" : "object-cover"} />
        </ResizableFrame>
      </div>

      <div ref={galleryRef} className="relative flex flex-wrap items-start" style={{ columnGap: gapX, rowGap: gapY }}>
        {units.map((u, n) => {
          if (u.kind === "text") return textBlock(u.text, undefined, { o: n * 100, s: u.s, e: u.e });
          const g = u.img;
          const fr = project.galleryFrames?.[g];
          // Texts set to "Full row" sit above / under the whole row on larger screens (on phones, right by the image).
          const isFull = (t: number) => (project.galleryFrames?.[t]?.w ?? 0) >= 100;
          const inAbove = u.above.filter((t) => !isFull(t));
          const inBelow = u.below.filter((t) => !isFull(t));
          const wrapped = inAbove.length > 0 || inBelow.length > 0;
          const fullAbove = u.above.filter(isFull).map((t, k) => textBlock(t, 1, { o: rowFirst[n] * 100 - 50 + k, s: u.s, e: u.e }));
          const fullBelow = u.below.filter(isFull).map((t, k) => textBlock(t, -1, { o: rowLast[n] * 100 + 50 + k, s: u.s, e: u.e }));
          const nextUnit = units[n + 1];
          const unitAttrs = { unit: 1, us: u.s, ue: u.e };
          const frame = (
            <ResizableFrame
              key={g}
              // Inside a block with texts the frame fills the block; "same height" stretching doesn't apply there.
              size={wrapped && fr?.m ? { ...fr, m: undefined } : fr}
              onResize={setGalleryFrame(g)}
              gap={gapX}
              defaultWidth={50}
              background={project.tint}
              className={`${wrapped ? "sm:w-full!" : "sm:order-[var(--o)]"} ${dragging(g)}`}
              boxStyle={wrapped ? undefined : ({ ["--o" as string]: n * 100 } as React.CSSProperties)}
              data={{ gi: g, kind: "img", ...(wrapped ? {} : unitAttrs) }}
              tools={
                <>
                  {moveHandle(u.s, u.e, handleBtn)}
                  {(fr?.w ?? 50) < 100 && nextUnit?.kind === "image" && (
                    <button
                      type="button"
                      title="Put this image and the next one side by side, same height"
                      onClick={() => sideBySide(g, nextUnit.img)}
                      className={toolBtn}
                    >
                      ⇆ Side by side
                    </button>
                  )}
                  <button
                    type="button"
                    title="Make this image take the whole row, or half of it"
                    onClick={() => toggleFull(g)}
                    className={toolBtn}
                  >
                    {(fr?.w ?? 50) >= 100 ? "◧ Half width" : "▭ Full width"}
                  </button>
                  <button type="button" title="Add a text above this image" onClick={() => addCaption(u, 1)} className={toolBtn}>
                    + Text above
                  </button>
                  <button type="button" title="Add a text under this image" onClick={() => addCaption(u, -1)} className={toolBtn}>
                    + Text below
                  </button>
                </>
              }
            >
              <EditableImage
                path={`${base}.gallery.${g}`}
                alt={`${project.title} — image ${g + 1}`}
                sizes={imgSizes}
                className={fr?.f === false ? "object-contain" : "object-cover"}
                onRemove={() => removeItem(g)}
              />
            </ResizableFrame>
          );
          return [
            ...fullAbove,
            wrapped ? (
              <div
                key={`u${g}`}
                data-unit={1}
                data-us={u.s}
                data-ue={u.e}
                className="flex w-full shrink-0 flex-col sm:order-[var(--o)] sm:w-[var(--fw)]"
                style={{ ["--fw" as string]: frameWidth(fr?.w ?? 50, gapX), ["--o" as string]: n * 100 }}
              >
                {inAbove.map((t) => textBlock(t, 1))}
                {frame}
                {inBelow.map((t) => textBlock(t, -1))}
              </div>
            ) : (
              frame
            ),
            ...fullBelow,
          ];
        })}
        {drop && <div className="pointer-events-none absolute z-40 rounded-full bg-accent shadow" style={drop.bar} />}
        <AddButton
          style={{ ["--g" as string]: `${gapX}px` }}
          className="aspect-[4/3] w-full sm:order-[999999] sm:w-[calc(50%-var(--g)/2)]"
          onClick={() => update((d) => void d.projects[i].gallery.push(emptyImage))}
        >
          Add image
        </AddButton>
        {editing && (
          <div className="flex w-full flex-wrap gap-3 sm:order-[999999]">
            <AddButton className="flex-1 py-4" onClick={() => addText(1)}>
              Add text
            </AddButton>
            <AddButton className="flex-1 py-4" onClick={() => addText(2)}>
              Add 2 text columns
            </AddButton>
          </div>
        )}
      </div>
    </article>
  );
}

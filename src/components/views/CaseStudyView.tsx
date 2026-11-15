"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { emptyImage } from "@/content/defaults";
import { AddButton, EditableImage, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";
import { useRef } from "react";
import { DEFAULT_GAP, DEFAULT_RATIO, ResizableFrame, framePx } from "@/components/edit/Frame";
import { LookTools, lookStyle } from "@/components/edit/TextLook";
import type { FrameSize, TextLook } from "@/content/types";
import { slugify } from "@/lib/path";

const toolBtn = "rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-ink shadow hover:bg-ink hover:text-paper";
const imgSizes = "(min-width: 1280px) 1280px, 100vw";

export function CaseStudyView({ slug }: { slug: string }) {
  const { content, editing, update, set, ui } = useContent();
  const router = useRouter();
  const galleryRef = useRef<HTMLDivElement>(null);
  const i = content.projects.findIndex((p) => p.slug === slug);
  const project = content.projects[i];

  if (!project) {
    return (
      <section className="flex min-h-[70svh] flex-col items-center justify-center px-4 text-center">
        <p className="font-serif text-6xl italic">{ui("projectNotFound")}</p>
        <Link href="/projects" className="mt-6 underline underline-offset-4">{ui("allProjects")}</Link>
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

  const gapX = project.gapX ?? DEFAULT_GAP;
  const gapY = project.gapY ?? DEFAULT_GAP;

  /** Put image g and the next one in one row, same height, keeping image g's width when it leaves room. */
  const sideBySide = (g: number) =>
    update((d) => {
      const p = d.projects[i];
      const frames = Array.from({ length: p.gallery.length }, (_, n) => p.galleryFrames?.[n] ?? null);
      const a = frames[g] ?? {};
      const w1 = a.w && a.w <= 80 ? a.w : 50;
      const w2 = Math.round((100 - w1) * 100) / 100;
      const r1 = a.r ?? DEFAULT_RATIO;
      const row = galleryRef.current?.clientWidth ?? 1200;
      const r2 = Math.round(((framePx(w1, row, gapX) * r1) / framePx(w2, row, gapX)) * 1000) / 1000;
      frames[g] = { ...a, w: w1, r: r1, m: undefined };
      frames[g + 1] = { ...frames[g + 1], w: w2, r: r2, m: true };
      p.galleryFrames = frames;
    });

  /** Switch an image between the whole row and half a row. A pair it was part of comes apart. */
  const toggleFull = (g: number) =>
    update((d) => {
      const p = d.projects[i];
      const frames = Array.from({ length: p.gallery.length }, (_, n) => p.galleryFrames?.[n] ?? null);
      const full = (frames[g]?.w ?? 50) >= 100;
      frames[g] = { ...frames[g], w: full ? undefined : 100, m: undefined };
      if (frames[g + 1]?.m) frames[g + 1] = { ...frames[g + 1], m: undefined };
      p.galleryFrames = frames;
    });

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
    <article className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-10 sm:pt-32">
      <Link href="/projects" className="mb-8 inline-flex items-center gap-2 text-sm text-gray transition-colors hover:text-ink">
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
          className="block max-w-4xl text-[length:calc(var(--s,1)*3rem)] font-semibold leading-[1.05] tracking-tight sm:text-[length:calc(var(--s,1)*4.5rem)]"
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
            className="block max-w-2xl text-[length:calc(var(--s,1)*1.125rem)] leading-relaxed text-gray sm:text-[length:calc(var(--s,1)*1.25rem)]"
            placeholder="Describe the project"
          />
        </LookTools>
      </div>

      <div className="mt-10 flex justify-center" style={{ marginBottom: gapY }}>
        <ResizableFrame size={project.coverFrame} onResize={(f) => set(`${base}.coverFrame`, f ?? undefined)} background={project.tint}>
          <EditableImage path={`${base}.cover`} alt={project.title} sizes={imgSizes} priority className={project.coverFrame?.f === false ? "object-contain" : "object-cover"} />
        </ResizableFrame>
      </div>

      <div ref={galleryRef} className="flex flex-wrap items-start" style={{ columnGap: gapX, rowGap: gapY }}>
        {project.gallery.map((_, g) => (
          <ResizableFrame
            key={g}
            size={project.galleryFrames?.[g]}
            onResize={setGalleryFrame(g)}
            gap={gapX}
            defaultWidth={50}
            background={project.tint}
            tools={
              <>
                {(project.galleryFrames?.[g]?.w ?? 50) < 100 && g < project.gallery.length - 1 && (
                  <button
                    type="button"
                    title="Put this image and the next one side by side, same height"
                    onClick={() => sideBySide(g)}
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
                  {(project.galleryFrames?.[g]?.w ?? 50) >= 100 ? "◧ Half width" : "▭ Full width"}
                </button>
              </>
            }
          >
            <EditableImage
              path={`${base}.gallery.${g}`}
              alt={`${project.title} — image ${g + 1}`}
              sizes={imgSizes}
              className={project.galleryFrames?.[g]?.f === false ? "object-contain" : "object-cover"}
              onRemove={() =>
                update((d) => {
                  d.projects[i].gallery.splice(g, 1);
                  const frames = d.projects[i].galleryFrames;
                  frames?.splice(g, 1);
                  // The image that slides into this spot no longer has a partner to match.
                  if (frames?.[g]?.m) frames[g] = { ...frames[g], m: undefined };
                })
              }
            />
          </ResizableFrame>
        ))}
        <AddButton
          style={{ ["--g" as string]: `${gapX}px` }}
          className="aspect-[4/3] w-full sm:w-[calc(50%-var(--g)/2)]"
          onClick={() => update((d) => void d.projects[i].gallery.push(emptyImage))}
        >
          Add image
        </AddButton>
      </div>
    </article>
  );
}

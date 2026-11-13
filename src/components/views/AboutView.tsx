"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { emptyImage } from "@/content/defaults";
import { AddButton, EditableImage, ItemControls, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";
import { ToolIcon } from "@/components/ToolIcon";

// Same pastel palette as the hero cursors.
const PASTEL = ["#c9d6ff", "#ffd1e1", "#e6f9a8", "#e3d4ff", "#ffe0c2", "#c8f0ee", "#fff3a8"];

// Where the small folders sit around the photo (desktop), and their float timing.
const FOLDER_SPOTS = [
  "right-0 sm:right-[-6%] top-[2%]",
  "left-[-8%] bottom-[22%]",
  "right-[-4%] bottom-[26%]",
];

const DOTS = {
  backgroundImage: "radial-gradient(color-mix(in srgb, var(--ink) 16%, transparent) 1.2px, transparent 1.2px)",
  backgroundSize: "22px 22px",
};

/** True once the element has scrolled into view (stays true). */
function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen] as const;
}

/** Figma-style selection handles: corner dots + pill handles on the edges. */
function Handles({ pills = true, delay = 1.1 }: { pills?: boolean; delay?: number }) {
  const dot = "absolute h-3.5 w-3.5 rounded-full border-2 border-accent bg-paper";
  const pop = (i: number) => ({ animation: `about-pop .35s cubic-bezier(.34,1.56,.64,1) ${delay + i * 0.06}s both` });
  return (
    <>
      <span className={`${dot} -left-[7px] -top-[7px]`} style={pop(0)} />
      <span className={`${dot} -right-[7px] -top-[7px]`} style={pop(1)} />
      <span className={`${dot} -bottom-[7px] -right-[7px]`} style={pop(2)} />
      <span className={`${dot} -bottom-[7px] -left-[7px]`} style={pop(3)} />
      {pills && (
        <>
          <span className="absolute -top-[5px] left-1/2 h-2.5 w-8 -translate-x-1/2 rounded-full border-2 border-accent bg-paper" style={pop(4)} />
          <span className="absolute -bottom-[5px] left-1/2 h-2.5 w-8 -translate-x-1/2 rounded-full border-2 border-accent bg-paper" style={pop(5)} />
          <span className="absolute -left-[5px] top-1/2 h-8 w-2.5 -translate-y-1/2 rounded-full border-2 border-accent bg-paper" style={pop(6)} />
          <span className="absolute -right-[5px] top-1/2 h-8 w-2.5 -translate-y-1/2 rounded-full border-2 border-accent bg-paper" style={pop(7)} />
        </>
      )}
    </>
  );
}

function Arrow({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg width="26" height="26" viewBox="0 0 22 22" aria-hidden className={className} style={style}>
      <path d="M3 2.5 19 9.4l-6.9 2.1-3 6.8z" fill="var(--ink)" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Mac-style blue folder; on hover the front tips open and the image inside peeks out. */
function MiniFolder({ i, label, image, editing }: { i: number; label: string; image: string; editing: boolean }) {
  return (
    <div className="group/folder flex w-24 flex-col items-center sm:w-28">
      <div className="relative h-[72px] w-full sm:h-[84px]">
        {/* back + tab */}
        <div className="absolute inset-x-0 bottom-0 top-2 rounded-lg bg-[#5aaef0]" />
        <div className="absolute left-0 top-0 h-4 w-[42%] rounded-t-lg bg-[#5aaef0]" />
        {/* the image inside */}
        <div
          className={`absolute inset-x-2 top-3 h-[70%] overflow-hidden rounded-md bg-paper shadow transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] ${
            editing ? "-translate-y-6 -rotate-3" : "group-hover/folder:-translate-y-7 group-hover/folder:-rotate-6"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image || emptyImage} alt="" className="h-full w-full object-cover object-top" />
        </div>
        {/* front */}
        <div
          className="absolute inset-x-0 bottom-0 h-[74%] origin-bottom rounded-lg bg-gradient-to-b from-[#9ed4ff] to-[#6cbaf6] shadow-[inset_0_1px_0_#ffffff80] transition-transform duration-500 group-hover/folder:[transform:perspective(300px)_rotateX(-30deg)]"
        />
      </div>
      <T
        path={`site.about.folders.${i}.label`}
        className="mt-2 rounded bg-paper/80 px-1.5 py-0.5 font-mono text-[11px] text-ink"
        placeholder="folder_name"
      />
    </div>
  );
}

export function AboutView() {
  const { content, editing, update, ui, text } = useContent();
  const about = content.site.about;
  const [fanRef, fanOpen] = useInView<HTMLDivElement>();
  const open = fanOpen || editing;

  return (
    <div className="relative" style={DOTS}>
      {/* ───────── Screen 1: the desktop ───────── */}
      <section className="mx-auto grid min-h-svh max-w-[1400px] items-center gap-16 px-5 pb-16 pt-32 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:px-16">
        <div>
          <div className="mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-sm font-medium uppercase tracking-widest text-gray">{ui("aboutLabel")}</span>
          </div>

          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            <T path="site.about.heading" placeholder="Tell you about" />{" "}
            <span className="relative mt-2 inline-block px-3">
              <span className="absolute inset-0 bg-accent/10" />
              <span
                className="absolute inset-0 border-2 border-accent"
                style={{ animation: "about-pop .35s ease-out 1.55s both" }}
              />
              <Handles pills={false} delay={1.6} />
              <T path="site.about.highlight" className="relative font-serif font-normal italic text-accent" placeholder="me!" />
              {/* A cursor glides in and "clicks" the word, which then gets selected. */}
              {!editing && (
                <Arrow
                  className="absolute left-[70%] top-[78%] drop-shadow"
                  style={{ animation: "about-cursor 1.8s cubic-bezier(.22,1,.36,1) .3s both" }}
                />
              )}
            </span>
          </h1>

          <T
            path="site.about.statement"
            as="p"
            multiline
            className="mt-8 block max-w-lg text-lg leading-relaxed text-ink/80 sm:text-xl"
            placeholder="A few sentences about you"
          />

        </div>

        {/* Photo in a selection frame, folders around it, dock underneath */}
        <div className="relative mx-auto w-full max-w-[520px] pb-10">
          <div className="relative mx-auto w-[68%] -rotate-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-accent-soft/40">
              <EditableImage path="site.about.photo" alt={content.site.fullName} priority sizes="(min-width: 1024px) 360px, 70vw" />
            </div>
            <div
              className="pointer-events-none absolute -inset-3 border-2 border-accent"
              style={{ animation: "about-reveal .9s cubic-bezier(.65,0,.35,1) .25s both" }}
            >
              <Handles />
            </div>
            <span
              className="absolute -left-3 -top-10 rounded bg-accent px-2 py-0.5 text-xs font-medium text-paper"
              style={{ animation: "about-pop .35s ease-out 1.3s both" }}
            >
              <T path="site.fullName" placeholder="Your name" />
            </span>
          </div>

          {about.folders.slice(0, 3).map((f, i) => (
            <div key={i} className={`absolute ${FOLDER_SPOTS[i]} ${i > 0 ? "hidden sm:block" : ""}`}>
              <div style={{ animation: `cursor-drift ${9 + i * 1.4}s ease-in-out ${-i * 2}s infinite` }}>
                <div style={{ animation: `about-pop .5s cubic-bezier(.34,1.56,.64,1) ${0.8 + i * 0.12}s both` }}>
                  <MiniFolder i={i} label={f.label} image={f.image} editing={editing} />
                </div>
              </div>
            </div>
          ))}

          {/* Dock: icons grow like the macOS dock on hover */}
          <div className="relative z-10 mx-auto mt-16 flex w-fit items-end gap-2 rounded-2xl border border-ink/10 bg-paper/70 px-3 py-2 shadow-lg backdrop-blur-md">
            {about.tools.map((t, i) => (
              <div
                key={i}
                className="group/tool relative origin-bottom transition-transform duration-200 hover:-translate-y-2 hover:scale-[1.35] [*:hover+&]:scale-[1.15] [&:has(+*:hover)]:scale-[1.15]"
              >
                <ToolIcon name={t.name} short={t.short} index={i} />
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-0.5 text-[11px] text-paper opacity-0 transition group-hover/tool:opacity-100">
                  {t.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Edit mode only: folder images and dock tool names are easier to change here */}
      {editing && (
        <section className="mx-auto max-w-5xl px-5 pb-16">
          <div className="rounded-3xl border-2 border-dashed border-ink/20 bg-paper p-6">
            <p className="mb-4 text-xs uppercase tracking-widest text-gray">Folder images</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {about.folders.slice(0, 3).map((f, i) => (
                <div key={i}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-line">
                    <EditableImage path={`site.about.folders.${i}.image`} alt="" sizes="200px" />
                  </div>
                  <T path={`site.about.folders.${i}.label`} className="mt-2 block font-mono text-xs" placeholder="folder_name" />
                </div>
              ))}
            </div>
            <p className="mb-4 mt-8 text-xs uppercase tracking-widest text-gray">Dock: the icon is picked from the tool name (Photoshop, Illustrator, InDesign, Figma, Final Cut Pro, Canva, CapCut). Other names show the short text.</p>
            <div className="flex flex-wrap gap-3">
              {about.tools.map((_, i) => (
                <div key={i} className="flex items-center gap-2 rounded-full bg-paper py-1 pl-3 pr-1 ring-1 ring-ink/10">
                  <T path={`site.about.tools.${i}.short`} className="font-semibold" placeholder="Ab" />
                  <span className="text-gray">·</span>
                  <T path={`site.about.tools.${i}.name`} placeholder="Tool name" />
                  <ItemControls listPath="site.about.tools" index={i} label="tool" className="relative" />
                </div>
              ))}
              {about.tools.length < 9 && (
                <AddButton
                  className="!rounded-full !p-2 px-4"
                  onClick={() => update((d) => void d.site.about.tools.push({ short: "Ab", name: "New tool" }))}
                >
                  Add tool
                </AddButton>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ───────── Screen 2: the folder that fans out ───────── */}
      <section className="flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-24">
        <div ref={fanRef} className="relative w-full max-w-5xl">
          {/* Cards: tucked into the folder until scrolled into view, then fanned out */}
          <div className="relative z-0 grid gap-4 sm:grid-cols-2 lg:block lg:h-[360px]">
            {about.cards.slice(0, 4).map((c, i, all) => {
              const mid = (all.length - 1) / 2;
              const angle = (i - mid) * 15.5;
              return (
                <article
                  key={i}
                  className={`group/card relative rounded-2xl border border-ink/10 bg-paper shadow-xl transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.34,1.3,.64,1)] lg:absolute lg:bottom-0 lg:left-1/2 lg:w-[228px] lg:-ml-[114px] lg:origin-[50%_320%] lg:[transform:var(--fan)] lg:hover:z-10 ${
                    open ? "" : "lg:opacity-0"
                  }`}
                  style={{
                    // Only used from lg up (see the class); on phones the cards are a plain grid.
                    ["--fan" as string]: open ? `rotate(${angle}deg)` : "translateY(140px) rotate(0deg) scale(.85)",
                    transitionDelay: `${i * 90}ms`,
                    boxShadow: `0 10px 30px ${PASTEL[i % PASTEL.length]}`,
                  }}
                >
                  <div className="transition-transform duration-300 lg:group-hover/card:-translate-y-5">
                    <div
                      className="flex items-center gap-1.5 rounded-t-2xl px-4 py-2.5"
                      style={{ background: PASTEL[i % PASTEL.length] }}
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
                      <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
                      <span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
                      <span className="ml-2 truncate font-mono text-[11px] text-ink/60">
                        {(text(`site.about.cards.${i}.title`) || "untitled").toLowerCase().replace(/\s+/g, "_")}.txt
                      </span>
                    </div>
                    <div className="p-5 pb-16">
                      <T path={`site.about.cards.${i}.title`} as="h3" className="block font-serif text-3xl italic" placeholder="Title" />
                      <T
                        path={`site.about.cards.${i}.body`}
                        as="p"
                        multiline
                        className="mt-3 block whitespace-pre-line text-sm leading-relaxed text-ink/75"
                        placeholder="Write something"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* The big folder the cards come out of (desktop) */}
          <div className="relative z-10 mx-auto -mt-12 hidden h-36 w-[440px] lg:block">
            <div className="absolute inset-x-0 bottom-0 h-full rounded-2xl bg-gradient-to-b from-[#9ed4ff] to-[#5aaef0] shadow-[0_20px_50px_#5aaef055,inset_0_1px_0_#ffffff90]" />
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-sm text-ink/70">about_{(content.site.name || "me").toLowerCase()}.zip</span>
          </div>
        </div>

        <p className="mt-20 text-center text-6xl sm:text-8xl">
          <T path="site.about.punchline.0" className="font-semibold tracking-tight" placeholder="Hiring" />{" "}
          <T path="site.about.punchline.1" className="font-serif italic" placeholder="her." />
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-7 py-3 font-medium text-paper transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent"
        >
          {ui("workTogether")} <span aria-hidden>→</span>
        </Link>
      </section>
    </div>
  );
}

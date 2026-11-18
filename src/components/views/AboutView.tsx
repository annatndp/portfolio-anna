"use client";

import { useEffect, useRef } from "react";
import { emptyImage } from "@/content/defaults";
import { AddButton, EditableImage, ItemControls, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";
import { ToolIcon } from "@/components/ToolIcon";
import { RichT } from "@/components/edit/RichText";
import { SocialLink, SocialLinkInput } from "@/components/edit/SocialLinkInput";

// Same pastel palette as the hero cursors.
const PASTEL = ["#c9d6ff", "#ffd1e1", "#e6f9a8", "#e3d4ff", "#ffe0c2", "#c8f0ee", "#fff3a8"];

// Where the small folders sit around the photo (desktop), and their float timing.
// Mobile spots stay inside the screen; from sm they move out around the photo.
const FOLDER_SPOTS = [
  "right-0 top-[2%] sm:right-[-6%]",
  "left-0 bottom-[30%] sm:left-[-8%] sm:bottom-[22%]",
  "right-0 bottom-[34%] sm:right-[-4%] sm:bottom-[26%]",
];

const DOTS = {
  backgroundImage: "radial-gradient(color-mix(in srgb, var(--ink) 16%, transparent) 1.2px, transparent 1.2px)",
  backgroundSize: "22px 22px",
};

/**
 * The cards start as small papers tucked in the folder. When the folder section is
 * scrolled into view they burst out (one quick animation) into the 2 × 2 grid.
 * Scrolling back up sends them back into the folder.
 */
function useCardsFromFolder() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 640px)");
    const TILT = [-9, -4, 4, 9, 0];
    // Spring curve (damping 0.62): quick start, soft ~8% overshoot, settles — like a macOS Dock stack.
    const SPRING = CSS.supports("transition-timing-function", "linear(0, 1)")
      ? "linear(0, 0.02, 0.073, 0.149, 0.24, 0.339, 0.441, 0.541, 0.636, 0.723, 0.801, 0.868, 0.926, 0.973, 1.01, 1.039, 1.059, 1.073, 1.081, 1.083, 1.083, 1.079, 1.073, 1.065, 1.057, 1.049, 1.04, 1.032, 1.025, 1.018, 1.012, 1.007, 1.003, 1, 0.997, 0.995, 0.994, 0.993, 0.993, 0.993, 0.993, 0.994, 0.994, 0.995, 0.996, 0.996, 0.997, 0.998, 1)"
      : "cubic-bezier(.22,1.2,.36,1)";
    const cards = () => [...el.querySelectorAll<HTMLElement>("[data-card]")];
    let open: boolean | null = null;

    // Where each card sits relative to the folder: tucked inside it, or lifted just above it.
    const poses = (card: HTMLElement, i: number) => {
      const folder = el.querySelector<HTMLElement>("[data-folder]")!;
      const fx = folder.offsetLeft + folder.offsetWidth / 2;
      const fy = folder.offsetTop + folder.offsetHeight * 0.3; // a bit high, so they peek out
      let x = card.offsetLeft;
      let y = card.offsetTop;
      for (let par = card.offsetParent as HTMLElement | null; par && par !== el; par = par.offsetParent as HTMLElement | null) {
        x += par.offsetLeft;
        y += par.offsetTop;
      }
      const dx = fx - (x + card.offsetWidth / 2);
      const dy = fy - (y + card.offsetHeight / 2);
      // Tucked size: about 210px wide; on a phone the cards are tall, so also cap the height to stay inside the folder.
      const small = Math.min(210 / card.offsetWidth, wide.matches ? Infinity : 170 / card.offsetHeight);
      // Lifted cards fan left / right like in a Figma folder animation (less on a phone, so they stay on screen).
      const spread = (i - (cards().length - 1) / 2) * (wide.matches ? 80 : 34);
      const lift = wide.matches ? 170 : 110;
      return {
        tucked: `translate(${dx}px, ${dy}px) rotate(${TILT[i % TILT.length]}deg) scale(${small})`,
        lifted: `translate(${dx + spread}px, ${dy - lift}px) rotate(${TILT[i % TILT.length] * 1.6}deg) scale(${small * 1.35})`,
      };
    };

    const running = new Map<HTMLElement, Animation>();

    const apply = (next: boolean, animate: boolean) => {
      open = next;
      el.dataset.open = next ? "1" : "0"; // tips the folder's front flap open (CSS)
      cards().forEach((card, i, all) => {
        const { tucked, lifted } = poses(card, i);
        const end = next ? "none" : tucked;
        // Start from wherever the card is right now (also mid-animation).
        const from = getComputedStyle(card).transform;
        running.get(card)?.cancel();
        card.style.transform = end;
        if (!animate) return;
        const anim = card.animate(
          next
            ? [
                // 1) rise straight out of the folder, 2) spring out to its spot in the grid
                { transform: from, easing: "cubic-bezier(.2,.7,.3,1)" },
                { transform: lifted, offset: 0.28, easing: SPRING },
                { transform: end },
              ]
            : [
                // back up above the folder, then drop in
                { transform: from, easing: "cubic-bezier(.4,0,.6,1)" },
                { transform: lifted, offset: 0.55, easing: "cubic-bezier(.5,0,.75,0)" },
                { transform: end },
              ],
          next
            ? { duration: 900, delay: i * 55, fill: "backwards" }
            : { duration: 520, delay: (all.length - 1 - i) * 40, fill: "backwards" },
        );
        running.set(card, anim);
      });
    };

    const check = (animate = true) => {
      const vh = window.innerHeight;
      if (reduce) return open !== true && apply(true, false);
      const folderTop = el.querySelector<HTMLElement>("[data-folder]")!.getBoundingClientRect().top;
      // Open as soon as the folder is on screen; close when it drops back to the bottom edge.
      // First check (or after a resize): no animation, just pick a side.
      if (open === null) apply(folderTop < vh * 0.88, false);
      else if (folderTop < vh * 0.85 && open !== true) apply(true, animate);
      else if (folderTop > vh * 0.92 && open !== false) apply(false, animate);
    };

    // On a tall screen the folder is already in view when the page loads. Start it closed so
    // the cards still burst out, after a short beat (the hero intro runs first).
    // If the page opens already scrolled past the folder, just show the cards open.
    let intro: number | undefined;
    const folderRect = el.querySelector<HTMLElement>("[data-folder]")!.getBoundingClientRect();
    if (!reduce && folderRect.bottom > 0) {
      apply(false, false);
      intro = window.setTimeout(() => check(), 700);
    } else check(false);
    const onScroll = () => check();
    const onResize = () => {
      open = null;
      check(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(intro);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return ref;
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
function MiniFolder({ i, image, editing }: { i: number; image: string; editing: boolean }) {
  return (
    <div className="group/folder flex w-16 flex-col items-center sm:w-28">
      <div className="relative h-[48px] w-full sm:h-[84px]">
        {/* back + tab */}
        <div className="absolute inset-x-0 bottom-0 top-2 rounded-lg bg-[#5aaef0]" />
        <div className="absolute left-0 top-0 h-3 w-[42%] rounded-t-md bg-[#5aaef0] sm:h-4 sm:rounded-t-lg" />
        {/* the image inside */}
        <div
          className={`absolute inset-x-2 top-3 h-[70%] overflow-hidden rounded-md bg-paper shadow transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] ${
            editing ? "-translate-y-4 -rotate-3 sm:-translate-y-6" : "group-hover/folder:-translate-y-5 group-hover/folder:-rotate-6 sm:group-hover/folder:-translate-y-7"
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
        className="mt-1.5 whitespace-nowrap rounded bg-paper/80 px-1 py-0.5 font-mono text-[9px] text-ink sm:mt-2 sm:px-1.5 sm:text-[11px]"
        placeholder="folder_name"
      />
    </div>
  );
}

/** Edit mode: card buttons in the title bar — move, delete, width and text size. */
function CardTools({ i, wide, scale }: { i: number | "info"; wide: boolean; scale: number }) {
  const { set } = useContent();
  const base = i === "info" ? "site.about.info" : `site.about.cards.${i}`;
  const btn =
    "flex h-8 min-w-8 items-center justify-center rounded-full bg-paper px-2 text-xs font-medium text-ink shadow ring-1 ring-ink/10 hover:bg-ink hover:text-paper";
  const zoom = (d: number) => set(`${base}.scale`, Math.round(Math.min(1.5, Math.max(0.6, scale + d)) * 100) / 100);
  return (
    <div className="relative ml-auto flex shrink-0 items-center gap-1.5">
      <button type="button" title="Smaller text" className={btn} onClick={() => zoom(-0.05)}>A−</button>
      <span className="w-10 text-center text-xs tabular-nums text-ink/60">{Math.round(scale * 100)}%</span>
      <button type="button" title="Bigger text" className={btn} onClick={() => zoom(0.05)}>A+</button>
      <button
        type="button"
        title={wide ? "Make the card half width" : "Make the card full width"}
        className={`${btn} hidden sm:flex`}
        onClick={() => set(`${base}.wide`, !wide)}
      >
        {wide ? "◧ Half" : "▭ Full"}
      </button>
      {i !== "info" && <ItemControls listPath="site.about.cards" index={i} label="card" className="!static" />}
    </div>
  );
}

/** Last card: email + social links (the same links as in the footer). */
function InfoCard({ index, wide }: { index: number; wide: boolean }) {
  const { content, editing, update, ui } = useContent();
  const { site } = content;
  const scale = site.about.info?.scale ?? 1;

  const color = PASTEL[index % PASTEL.length];
  const link = "underline decoration-1 underline-offset-4 hover:text-accent";
  return (
    <article
      id="contact"
      data-card
      className={`group/card relative origin-center scroll-mt-24 rounded-3xl border border-ink/10 bg-paper shadow-xl hover:z-10 ${wide ? "sm:col-span-2" : ""}`}
      style={{ boxShadow: `0 12px 36px ${color}` }}
    >
      <div className="transition-transform duration-300 group-hover/card:-translate-y-2">
        <div className="flex items-center gap-2 rounded-t-3xl px-7 py-4" style={{ background: color }}>
          <span className="h-3 w-3 rounded-full bg-ink/20" />
          <span className="h-3 w-3 rounded-full bg-ink/20" />
          <span className="h-3 w-3 rounded-full bg-ink/20" />
          <span className="ml-2 truncate font-mono text-sm text-ink/60 lg:text-base">{ui("info").toLowerCase()}.txt</span>
          {editing && <CardTools i="info" wide={wide} scale={scale} />}
        </div>
        <div className="p-8 lg:p-10" style={scale !== 1 ? { zoom: scale } : undefined}>
          <h3 className="font-serif text-5xl italic lg:text-[64px] lg:leading-[1.05]">{ui("info")}</h3>
          <dl className={`mt-6 grid gap-6 text-lg text-ink/75 lg:text-[21px] ${wide ? "sm:grid-cols-[auto_1fr] sm:gap-x-12" : ""}`}>
            <dt className="font-mono text-sm uppercase tracking-widest text-gray sm:pt-1.5">{ui("formEmail")}</dt>
            <dd className={`-mt-4 ${wide ? "sm:mt-0" : ""}`}>
              {editing ? (
                <T path="site.email" placeholder="you@email.com" />
              ) : (
                <a href={`mailto:${site.email}`} className={`${link} break-all`}>
                  {site.email}
                </a>
              )}
            </dd>
            <dt className="font-mono text-sm uppercase tracking-widest text-gray sm:pt-1.5">Social</dt>
            <dd className={`-mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 ${wide ? "sm:mt-0" : ""}`}>
              {site.socials.map((s, i) =>
                editing ? (
                  <span key={i} className="relative flex items-center gap-2 pr-24">
                    <T path={`site.socials.${i}.label`} placeholder="Name" />
                    <SocialLinkInput i={i} />
                    <ItemControls listPath="site.socials" index={i} label="link" className="right-0 top-1/2 -translate-y-1/2 scale-75" />
                  </span>
                ) : (
                  <SocialLink key={i} href={s.href} className={link}>
                    {s.label}
                  </SocialLink>
                ),
              )}
              {editing && (
                <AddButton className="!p-2" onClick={() => update((d) => void d.site.socials.push({ label: "New link", href: "#" }))}>
                  Add link
                </AddButton>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </article>
  );
}

/** Edit mode: drag the right edge of the card grid to make the cards wider or narrower. */
function WidthHandle() {
  const { content, set } = useContent();
  const width = content.site.about.cardsWidth || 1240;
  const start = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const box = e.currentTarget.parentElement!.getBoundingClientRect();
    const center = box.left + box.width / 2;
    const move = (ev: PointerEvent) => {
      const next = Math.round(Math.min(2000, Math.max(640, 2 * (ev.clientX - center))) / 10) * 10;
      set("site.about.cardsWidth", next);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return (
    <button
      type="button"
      onPointerDown={start}
      title="Drag to change the card width"
      className="absolute -right-5 bottom-0 top-[260px] z-20 flex w-3 cursor-ew-resize justify-center rounded-full bg-accent/80 hover:bg-accent"
    >
      <span className="absolute -bottom-9 right-0 whitespace-nowrap rounded-full bg-accent px-2 py-1 text-xs font-medium text-paper shadow">
        ↔ {width}px
      </span>
    </button>
  );
}

export function AboutView() {
  const { content, editing, update, ui, text } = useContent();
  const about = content.site.about;
  const fanRef = useCardsFromFolder();
  // Half-width cards fill the grid two by two; the Info card takes the free half after them, or the whole row.
  const halves = about.cards.filter((c) => !c.wide).length;
  const infoWide = about.info?.wide ?? halves % 2 === 0;

  return (
    <div className="relative overflow-x-clip" style={DOTS}>
      {/* ───────── Screen 1: the desktop ───────── */}
      <section className="mx-auto grid max-w-[1400px] items-center gap-16 px-5 pb-4 pt-32 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10 lg:px-16 [&>*]:min-w-0">
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
            <div key={i} className={`absolute z-[1] ${FOLDER_SPOTS[i]}`}>
              <div style={{ animation: `cursor-drift ${9 + i * 1.4}s ease-in-out ${-i * 2}s infinite` }}>
                <div style={{ animation: `about-pop .5s cubic-bezier(.34,1.56,.64,1) ${0.8 + i * 0.12}s both` }}>
                  <MiniFolder i={i} image={f.image} editing={editing} />
                </div>
              </div>
            </div>
          ))}

          {/* Dock: icons grow like the macOS dock on hover */}
          <div className="relative z-10 mx-auto mt-16 flex w-fit max-w-full flex-wrap items-end justify-center gap-1 rounded-2xl border border-ink/10 bg-paper/70 px-2 py-2 shadow-lg backdrop-blur-md sm:gap-2 sm:px-3">
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

      {/* ───────── Screen 2: cards jump out of a small zip folder as you scroll ───────── */}
      {/* Folder section: fills the screen and snaps into view, then the cards burst out. */}
      <section className="relative px-5 pb-24 pt-10 sm:px-10">
        <div className="w-full">
        <div ref={fanRef} className="group/fold relative mx-auto w-full" style={{ maxWidth: about.cardsWidth || 1240 }}>
          {/* Small folder: back + tab behind the cards, frosted front in front of them */}
          <div data-folder className="relative mx-auto h-[190px] w-[250px]">
            <div className="absolute left-0 top-0 h-9 w-[40%] rounded-t-[14px] bg-[#4ea4ea]" />
            <div className="absolute inset-x-0 bottom-0 top-6 rounded-[14px] rounded-tl-none bg-gradient-to-b from-[#4ea4ea] to-[#3d93dc]" />
          </div>

          <div className="relative z-[1] mt-12 grid gap-6 sm:grid-cols-2 lg:gap-9">
            {about.cards.map((c, i) => (
              <article
                key={i}
                data-card
                className={`group/card relative origin-center rounded-3xl ${
                  (c.wide ?? false) ? "sm:col-span-2" : ""
                } border border-ink/10 bg-paper shadow-xl hover:z-10`}
                style={{ boxShadow: `0 12px 36px ${PASTEL[i % PASTEL.length]}` }}
              >
                <div className="transition-transform duration-300 group-hover/card:-translate-y-2">
                  <div
                    className="flex items-center gap-2 rounded-t-3xl px-7 py-4"
                    style={{ background: PASTEL[i % PASTEL.length] }}
                  >
                    <span className="h-3 w-3 rounded-full bg-ink/20" />
                    <span className="h-3 w-3 rounded-full bg-ink/20" />
                    <span className="h-3 w-3 rounded-full bg-ink/20" />
                    <span className="ml-2 truncate font-mono text-sm text-ink/60 lg:text-base">
                      {(text(`site.about.cards.${i}.title`) || "untitled").toLowerCase().replace(/\s+/g, "_")}.txt
                    </span>
                    {editing && <CardTools i={i} wide={c.wide ?? false} scale={c.scale ?? 1} />}
                  </div>
                  <div className="p-8 lg:p-10" style={c.scale && c.scale !== 1 ? { zoom: c.scale } : undefined}>
                    <T path={`site.about.cards.${i}.title`} as="h3" className="block font-serif text-5xl italic lg:text-[64px] lg:leading-[1.05]" placeholder="Title" />
                    <div className="mt-6">
                      <RichT
                        path={`site.about.cards.${i}.body`}
                        linkLanguages={false}
                        className="text-lg leading-relaxed text-ink/75 lg:text-[21px] lg:leading-relaxed"
                        placeholder="Write something"
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
            <InfoCard index={about.cards.length} wide={infoWide} />
            {editing && (
              <AddButton
                className="sm:col-span-2"
                onClick={() => update((d) => void d.site.about.cards.push({ title: "New card", body: "" }))}
              >
                Add card
              </AddButton>
            )}
          </div>

          {editing && <WidthHandle />}

          {/* Frosted front flap: tucked cards show through blurred; it tips forward when the folder opens */}
          <div className="pointer-events-none absolute left-1/2 top-[58px] z-[2] h-[132px] w-[250px] -translate-x-1/2 [perspective:1400px]">
            <div className="absolute inset-0 origin-bottom rounded-[14px] border border-white/50 bg-gradient-to-b from-[#b4deff]/75 to-[#5aaef0]/85 shadow-[0_16px_36px_#5aaef055,inset_0_1px_0_#ffffffb0] backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(.3,1.4,.5,1)] group-data-[open=1]/fold:[transform:rotateX(-42deg)]" />
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-sm text-ink/70">
              about_{(content.site.name || "me").toLowerCase()}.zip
            </span>
          </div>
        </div>

        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { AddButton, ItemControls, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";

// Where each cursor sits in the hero (% of width/height), its color and how strongly it follows the mouse.
const SLOTS = [
  { x: 10, y: 20, bg: "#002fff", fg: "#fff", depth: 28 },
  { x: 76, y: 16, bg: "#ff6b9a", fg: "#fff", depth: -22 },
  { x: 4, y: 64, bg: "#c8f169", fg: "#050505", depth: -32 },
  { x: 82, y: 60, bg: "#ff8a3d", fg: "#050505", depth: 24 },
  { x: 20, y: 84, bg: "#8b5cf6", fg: "#fff", depth: 18 },
  { x: 66, y: 86, bg: "#a8dadc", fg: "#050505", depth: -18 },
];

function Arrow({ color }: { color: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      aria-hidden
      style={{ filter: `drop-shadow(0 0 5px ${color}99)` }}
    >
      <path d="M3 2.5 19 9.4l-6.9 2.1-3 6.8z" fill={color} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Figma-style cursors drifting around the hero, each labelled with something Anna does. */
export function HeroCursors() {
  const { content, editing, update, text } = useContent();
  const skills = content.site.skills ?? [];
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) return;
    const el = layer.current;
    const hero = el?.parentElement;
    if (!el || !hero) return;

    const move = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      // -0.5 … 0.5 around the hero center, used for the parallax shift.
      el.style.setProperty("--mx", String(x / r.width - 0.5));
      el.style.setProperty("--my", String(y / r.height - 0.5));
    };
    const leave = () => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
    };
  }, [editing]);

  // Edit mode: a plain row of tags under the heading so the labels are easy to change.
  if (editing) {
    return (
      <div className="mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-3">
        <span className="w-full text-center text-xs uppercase tracking-widest text-gray">Floating cursor labels</span>
        {skills.map((_, i) => {
          const s = SLOTS[i % SLOTS.length];
          return (
            <div key={i} className="flex items-center gap-2 rounded-full bg-paper p-1 pr-2 ring-1 ring-ink/10">
              <T
                path={`site.skills.${i}`}
                className="rounded-full px-3 py-1.5 text-sm font-medium"
                placeholder="Skill"
              />
              <span className="h-3 w-3 rounded-full" style={{ background: s.bg }} />
              <ItemControls listPath="site.skills" index={i} label="label" className="relative" />
            </div>
          );
        })}
        {skills.length < SLOTS.length && (
          <AddButton className="!rounded-full !p-2 px-4" onClick={() => update((d) => void d.site.skills.push("New skill"))}>
            Add label
          </AddButton>
        )}
      </div>
    );
  }

  return (
    <div ref={layer} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {skills.slice(0, SLOTS.length).map((label, i) => {
        const s = SLOTS[i];
        return (
          <div
            key={i}
            className={`absolute transition-transform duration-700 ease-out ${i >= 4 ? "hidden sm:block" : ""}`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: `translate(calc(var(--mx, 0) * ${s.depth}px * 2), calc(var(--my, 0) * ${s.depth}px * 2))`,
            }}
          >
            <div style={{ animation: `cursor-drift ${7 + i * 1.3}s ease-in-out ${-i * 1.7}s infinite` }}>
              <div
                className="pointer-events-auto origin-top-left transition-transform duration-300 hover:scale-110"
                style={{ animation: `cursor-pop 0.6s cubic-bezier(.34,1.56,.64,1) ${0.4 + i * 0.15}s both` }}
              >
                <Arrow color={s.bg} />
                <span
                  className="ml-4 -mt-1 inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium sm:text-sm"
                  style={{
                    background: s.bg,
                    color: s.fg,
                    // Soft pastel neon glow in the tag's own color.
                    boxShadow: `0 0 0 1px ${s.bg}33, 0 4px 14px ${s.bg}66, 0 0 28px 4px ${s.bg}40`,
                  }}
                >
                  {text(`site.skills.${i}`) || label}
                </span>
              </div>
            </div>
          </div>
        );
      })}

    </div>
  );
}

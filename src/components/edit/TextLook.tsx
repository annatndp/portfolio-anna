"use client";

import type { TextLook } from "@/content/types";
import { useContent } from "./ContentProvider";
import { useEffect, useRef, useState } from "react";
import { resizeSelection, selectionSize } from "./RichText";

const NAMED: Record<string, string> = { ink: "var(--ink)", gray: "var(--gray)", accent: "var(--accent)" };
const WEIGHTS: [number, string][] = [
  [300, "Light"],
  [400, "Regular"],
  [500, "Medium"],
  [600, "Semibold"],
  [700, "Bold"],
];

/** Inline style for a text look. Size works through `--s`, which the element's font-size class multiplies. */
export function lookStyle(look?: TextLook): React.CSSProperties | undefined {
  if (!look) return undefined;
  return {
    ...(look.s != null && { ["--s" as string]: look.s }),
    ...(look.w != null && { fontWeight: look.w }),
    ...(look.c && { color: NAMED[look.c] ?? look.c }),
    ...(look.al === "c" && { textAlign: "center" as const, marginInline: "auto" }),
    // Same widths as the image frames: half = one gallery image (minus half the gap), full = the big image.
    // Phones always use the full width. The element's class applies --tw from the sm breakpoint up.
    ...(look.fw && {
      maxWidth: "none",
      ["--tw" as string]: look.fw === "full" ? "100%" : "calc(50% - var(--gx, 24px) / 2)",
    }),
  };
}

export const keep = (e: React.MouseEvent) => e.preventDefault(); // don't steal focus from the text being edited
export const btn = "flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs text-ink hover:bg-ink hover:text-paper";

/**
 * Wraps a text block; in edit mode a small toolbar (size, weight, color) shows on hover.
 * Looks are stored on the project, so they apply to both languages.
 */
export function LookTools({
  look,
  onChange,
  defaultWeight,
  width = true,
  weight = true,
  extra,
  children,
}: {
  /** Show the Auto / ½ / Full text box width buttons. */
  width?: boolean;
  /** Show the weight menu (off where the text has its own toolbar to set the weight of marked words). */
  weight?: boolean;
  /** More buttons at the end of the toolbar. */
  extra?: React.ReactNode;
  look?: TextLook;
  onChange: (next: TextLook | undefined) => void;
  defaultWeight: number;
  children: React.ReactNode;
}) {
  const { editing } = useContent();
  const box = useRef<HTMLDivElement>(null);
  /** Size of the marked text inside this block (null = nothing marked here, the % shows the whole block). */
  const [marked, setMarked] = useState<number | null>(null);
  useEffect(() => {
    if (!editing) return;
    const onSel = () => {
      const sel = window.getSelection();
      const inside = !!sel?.rangeCount && !!box.current?.contains(sel.getRangeAt(0).commonAncestorContainer);
      setMarked(inside ? selectionSize() : null);
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, [editing]);
  if (!editing) return <>{children}</>;

  const s = look?.s ?? 1;
  const put = (patch: Partial<TextLook>) => {
    const next = { ...look, ...patch };
    for (const k of Object.keys(next) as (keyof TextLook)[]) if (next[k] == null) delete next[k];
    onChange(Object.keys(next).length ? next : undefined);
  };
  const size = (d: number) => {
    // Marked text inside the box: only that text changes size.
    const part = resizeSelection(d * 2);
    if (part != null) {
      setMarked(part);
      return;
    }
    const v = Math.round(Math.min(2.5, Math.max(0.5, s + d)) * 100) / 100;
    put({ s: v === 1 ? undefined : v });
  };
  const custom = look?.c && !NAMED[look.c] ? look.c : "#000000";

  return (
    <div ref={box} className="group/look relative">
      <div className="absolute bottom-full left-0 z-30 hidden pb-2 group-focus-within/look:block group-hover/look:block">
        <div className="flex items-center gap-1 whitespace-nowrap rounded-xl bg-paper p-1 font-sans text-xs font-normal normal-case tracking-normal text-ink shadow-lg ring-1 ring-ink/10">
          <button type="button" title="Smaller (only the marked text, if any is marked)" className={btn} onMouseDown={keep} onClick={() => size(-0.05)}>
            A−
          </button>
          <span
            title={marked != null ? "Size of the marked text" : "Size of the whole text"}
            className={`w-10 text-center tabular-nums ${marked != null ? "text-accent" : "text-ink/60"}`}
          >
            {Math.round((marked ?? s) * 100)}%
          </span>
          <button type="button" title="Bigger (only the marked text, if any is marked)" className={btn} onMouseDown={keep} onClick={() => size(0.05)}>
            A+
          </button>
          {weight && <span className="mx-1 h-5 w-px bg-ink/15" />}
          {weight && <select
            title="Weight"
            value={look?.w ?? defaultWeight}
            onChange={(e) => {
              const w = Number(e.target.value);
              put({ w: w === defaultWeight ? undefined : w });
            }}
            className="h-7 cursor-pointer rounded-md bg-transparent px-1 text-xs hover:bg-ink/5"
          >
            {WEIGHTS.map(([w, name]) => (
              <option key={w} value={w}>
                {name}
              </option>
            ))}
          </select>}
          <span className="mx-1 h-5 w-px bg-ink/15" />
          {(["ink", "gray", "accent"] as const).map((c) => (
            <button
              key={c}
              type="button"
              title={c === "ink" ? "Dark" : c === "gray" ? "Grey" : "Blue"}
              onMouseDown={keep}
              onClick={() => put({ c })}
              className={`h-6 w-6 rounded-full ring-offset-1 ${look?.c === c ? "ring-2 ring-ink" : "ring-1 ring-ink/15"}`}
              style={{ background: NAMED[c] }}
            />
          ))}
          <label
            title="Any color"
            className={`relative h-6 w-6 cursor-pointer overflow-hidden rounded-full ring-offset-1 ${
              look?.c && !NAMED[look.c] ? "ring-2 ring-ink" : "ring-1 ring-ink/15"
            }`}
            style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
          >
            <input type="color" value={custom} onChange={(e) => put({ c: e.target.value })} className="absolute inset-0 opacity-0" />
          </label>
          {width && <span className="mx-1 h-5 w-px bg-ink/15" />}
          {width && <div className="flex rounded-md bg-ink/5 p-0.5" title="Text box width">
            {(
              [
                [undefined, "Auto", "Normal reading width"],
                ["half", "½", "As wide as a half-width image"],
                ["full", "Full", "As wide as the big image"],
              ] as const
            ).map(([fw, label, hint]) => (
              <button
                key={label}
                type="button"
                title={hint}
                onMouseDown={keep}
                onClick={() => put({ fw })}
                className={`h-6 rounded px-2 ${look?.fw === fw ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>}
          <span className="mx-1 h-5 w-px bg-ink/15" />
          <button
            type="button"
            title={look?.al === "c" ? "Align the text to the left" : "Center the text"}
            className={`${btn} ${look?.al === "c" ? "bg-ink text-paper" : ""}`}
            onMouseDown={keep}
            onClick={() => put({ al: look?.al === "c" ? undefined : "c" })}
          >
            ≡ Center
          </button>
          <span className="mx-1 h-5 w-px bg-ink/15" />
          <button type="button" title="Reset" className={btn} onMouseDown={keep} onClick={() => onChange(undefined)}>
            ↺
          </button>
          {extra && <span className="mx-1 h-5 w-px bg-ink/15" />}
          {extra}
        </div>
      </div>
      {children}
    </div>
  );
}

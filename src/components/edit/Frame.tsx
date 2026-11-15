"use client";

import { useRef } from "react";
import type { FrameSize } from "@/content/types";
import { useContent } from "./ContentProvider";

const WIDTHS = [25, 100 / 3, 50, 200 / 3, 75, 100];
const RATIOS: [number, string][] = [
  [9 / 16, "16:9"],
  [2 / 3, "3:2"],
  [3 / 4, "4:3"],
  [4 / 5, "5:4"],
  [1, "1:1"],
  [5 / 4, "4:5"],
  [4 / 3, "3:4"],
  [3 / 2, "2:3"],
];
export const DEFAULT_RATIO = 3 / 4;
export const DEFAULT_GAP = 24;
export const DEFAULT_CORNER = 24;

/** Width in px of a frame that takes w% of a row of `row` px with `gap` px between frames. */
export const framePx = (w: number, row: number, gap: number) => (w / 100) * (row + gap) - gap;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const snap = (v: number, targets: number[], within: number) => targets.find((t) => Math.abs(t - v) <= within * t) ?? v;
const ratioName = (r: number) => RATIOS.find(([v]) => Math.abs(v - r) < 0.005)?.[1] ?? `1:${r.toFixed(2)}`;

/**
 * Image frame whose width (share of the row) and height can be dragged in edit mode.
 * `gap` is the space between frames in the same row, so widths like 50% + 50% fit exactly.
 */
export function ResizableFrame({
  size,
  onResize,
  gap = 0,
  defaultWidth = 100,
  background,
  className = "",
  tools,
  children,
}: {
  /** Extra edit-mode buttons, shown top right. */
  tools?: React.ReactNode;
  size?: FrameSize | null;
  onResize: (next: FrameSize | null) => void;
  gap?: number;
  /** Width in % before anything is dragged. */
  defaultWidth?: number;
  background?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { editing } = useContent();
  const box = useRef<HTMLDivElement>(null);
  const w = size?.w ?? defaultWidth;
  const r = size?.r ?? DEFAULT_RATIO;

  function start(e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const el = box.current!;
    const rect = el.getBoundingClientRect();
    const row = el.parentElement!.getBoundingClientRect().width;
    // No text selection on the page while dragging.
    const prevSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    const x0 = e.clientX;
    const y0 = e.clientY;
    const move = (ev: PointerEvent) => {
      const px = rect.width + (ev.clientX - x0);
      // Undo the gap share so the stored % matches what the eye sees ("half the row").
      const pct = clamp(((px + gap) / (row + gap)) * 100, 20, 100);
      const nextW = Math.round(snap(pct, WIDTHS, 0.04) * 100) / 100;
      const h = rect.height + (ev.clientY - y0);
      const nextR = Math.round(snap(clamp(h / Math.max(px, 40), 0.3, 2.5), RATIOS.map(([v]) => v), 0.03) * 1000) / 1000;
      onResize({ ...size, w: nextW, r: nextR, m: undefined });
    };
    const up = () => {
      document.body.style.userSelect = prevSelect;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const corner = size?.c ?? DEFAULT_CORNER;
  const setCorner = (c: number) => onResize({ ...size, c: c === DEFAULT_CORNER ? undefined : c });

  const style = {
    background,
    borderRadius: corner,
    aspectRatio: `${1 / r}`,
    ["--fw" as string]: `calc(${w}% - ${gap}px * ${(100 - w) / 100} - ${w < 100 ? 0.5 : 0}px)`,
  } as React.CSSProperties;

  return (
    <div ref={box} className={`group/frame relative w-full shrink-0 overflow-hidden sm:w-[var(--fw)] ${size?.m ? "sm:self-stretch sm:aspect-auto!" : ""} ${className}`} style={style}>
      {children}
      {editing && tools && <div className="absolute right-3 top-3 z-20 flex gap-2">{tools}</div>}
      {editing && (
        <div className="absolute bottom-2 left-2 z-20 hidden items-center gap-1 rounded-full bg-paper py-1 pl-1 pr-3 text-xs text-ink shadow group-hover/frame:flex">
          <button
            type="button"
            title="Square corners"
            onClick={() => setCorner(0)}
            className={`flex h-7 w-7 items-center justify-center rounded-full hover:bg-ink/10 ${corner === 0 ? "bg-ink/10" : ""}`}
          >
            <span className="h-3.5 w-3.5 border-[1.5px] border-current" />
          </button>
          <button
            type="button"
            title="Round corners"
            onClick={() => setCorner(DEFAULT_CORNER)}
            className={`flex h-7 w-7 items-center justify-center rounded-full hover:bg-ink/10 ${corner === DEFAULT_CORNER ? "bg-ink/10" : ""}`}
          >
            <span className="h-3.5 w-3.5 rounded-[5px] border-[1.5px] border-current" />
          </button>
          <input
            type="range"
            min={0}
            max={96}
            step={2}
            value={corner}
            title="Corner roundness"
            onChange={(e) => setCorner(Number(e.target.value))}
            className="w-24 accent-[var(--accent)]"
          />
          <span className="w-9 text-right tabular-nums text-gray">{corner}px</span>
        </div>
      )}
      {editing && (
        <button
          type="button"
          onPointerDown={start}
          onDoubleClick={() => onResize(size?.c != null ? { c: size.c } : null)}
          title="Drag to resize the frame · double-click to reset"
          className="group/rs absolute bottom-2 right-2 z-20 flex h-9 w-9 cursor-nwse-resize touch-none items-center justify-center rounded-full bg-ink text-paper shadow hover:bg-accent"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M13 5v8H5M13 13 3 3M1 9V1h8" />
          </svg>
          <span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded-full bg-ink px-2 py-1 text-xs font-medium text-paper shadow group-hover/rs:block group-active/rs:block">
            {Math.round(w)}% · {size?.m ? "same height" : ratioName(r)}
          </span>
        </button>
      )}
    </div>
  );
}

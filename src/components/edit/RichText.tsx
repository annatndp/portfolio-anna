"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { getAt } from "@/lib/path";
import { useContent } from "./ContentProvider";

// Formatted text: bold, italic, 3 fonts, 5 sizes, 2 colors, and "push to the right"
// (e.g. a year at the end of a line). Stored as a small subset of HTML.
// Only these tags/attributes survive, so pasted or typed markup can't run scripts.
const TAGS = new Set(["b", "strong", "i", "em", "u", "br", "div", "p", "font", "span", "ul", "ol", "li"]);
const FACES = new Set(["sans", "serif", "mono"]);
const SIZES = new Set(["1", "2", "3", "4", "5"]);
// Colors are stored as placeholder values; globals.css maps them to the site colors.
const COLORS = { dark: "#000001", grey: "#000002" };
const COLOR_SET = new Set(Object.values(COLORS));
// span classes: "r" = pushed right, "w300"…"w700" = weight of the marked text.
const WEIGHTS: [number, string][] = [
  [300, "Light"],
  [400, "Regular"],
  [500, "Medium"],
  [600, "Semibold"],
  [700, "Bold"],
];
const SPAN_CLASSES = new Set(["r", ...WEIGHTS.map(([w]) => `w${w}`)]);

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function sanitizeRich(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (tag, name: string, attrs: string) => {
      const t = name.toLowerCase();
      if (!TAGS.has(t)) return "";
      if (tag.startsWith("</")) return `</${t}>`;
      if (t === "span") {
        const cls = attrs.match(/class="([^"]*)"/)?.[1];
        return cls && SPAN_CLASSES.has(cls) ? `<span class="${cls}">` : "<span>";
      }
      if (t !== "font") return `<${t}>`;
      const face = attrs.match(/face="([^"]*)"/)?.[1];
      const size = attrs.match(/size="([^"]*)"/)?.[1];
      const color = attrs.match(/color="([^"]*)"/)?.[1]?.toLowerCase();
      return `<font${face && FACES.has(face) ? ` face="${face}"` : ""}${size && SIZES.has(size) ? ` size="${size}"` : ""}${
        color && COLOR_SET.has(color) ? ` color="${color}"` : ""
      }>`;
    });
}

/** Plain text (older content) becomes HTML with line breaks; HTML is cleaned. */
export function toRichHtml(value: string) {
  return /<[a-z][\s\S]*>/i.test(value) ? sanitizeRich(value) : escapeHtml(value).replace(/\n/g, "<br>");
}

/** Spacing for one text block, saved next to it as `<path>Style` (same in both languages). */
export type TextStyle = { lh?: number; ls?: number; gap?: number };
const DEFAULT_STYLE = { lh: 1.65, ls: 0, gap: 0 };

function styleFor(st: TextStyle | undefined): React.CSSProperties | undefined {
  if (!st) return undefined;
  return {
    ...(st.lh != null && { lineHeight: st.lh }),
    ...(st.ls != null && { letterSpacing: `${st.ls}em` }),
    ...(st.gap != null && { ["--gap" as string]: `${st.gap}em` }),
  };
}

function Slider({ label, value, min, max, step, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-xs text-ink">
      <span className="w-24 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
      <span className="w-12 shrink-0 text-right tabular-nums text-gray">{value}{unit}</span>
    </label>
  );
}

const btn =
  "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm text-ink hover:bg-ink hover:text-paper";

/** Rich text that becomes an editor with a small toolbar in edit mode. */
export function RichT({
  path,
  className = "",
  placeholder = "Type here…",
  floating = false,
  style: extraStyle,
  textStyle,
  onTextStyle,
}: {
  path: string;
  className?: string;
  placeholder?: string;
  /** Toolbar only while the text is being edited, floating under it (for small texts between images). */
  floating?: boolean;
  /** Extra inline style (e.g. a text look). */
  style?: React.CSSProperties;
  /** Spacing stored somewhere else than `<path>Style` (needed when the text lives in a list). */
  textStyle?: TextStyle;
  onTextStyle?: (next: TextStyle | undefined) => void;
}) {
  const { editing, text, setText, content, set } = useContent();
  const ref = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState(false);
  const [weightMenu, setWeightMenu] = useState(false);
  const value = text(path);
  const html = toRichHtml(value);
  const st = onTextStyle ? textStyle : (getAt(content, `${path}Style`) as TextStyle | undefined);
  const putStyle = (next: TextStyle | undefined) => (onTextStyle ? onTextStyle(next) : set(`${path}Style`, next));
  const style = { ...extraStyle, ...styleFor(st) };
  /** HTML the editor itself just saved: the box already shows it, so it isn't redrawn (which would lose the selection). */
  const shown = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!editing) shown.current = null; // the box is gone; draw it again when it comes back
    if (!editing || !ref.current || html === shown.current) return;
    ref.current.innerHTML = html;
    shown.current = html;
  }, [editing, html]);

  if (!editing) return value ? <div className={`rich ${className}`} style={style} dangerouslySetInnerHTML={{ __html: html }} /> : null;

  const cur = { ...DEFAULT_STYLE, ...st };
  const setStyle = (k: keyof TextStyle, v: number) => putStyle({ ...st, [k]: v });

  const save = () => {
    const next = sanitizeRich(ref.current?.innerHTML ?? "").replace(/(<br>|\s)+$/g, "");
    if (next === html) return;
    shown.current = toRichHtml(next);
    setText(path, next);
  };
  // Toolbar buttons keep the text selection (mousedown is cancelled), apply the command, then save.
  const cmd = (name: string, arg?: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(name, false, arg);
    save();
  };

  // Give only the marked text a weight: wrap it in a span (dropping weights / bold inside it), keep it marked.
  const setWeight = (w: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWeightMenu(false);
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !ref.current) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed || !ref.current.contains(range.commonAncestorContainer)) return;
    const span = document.createElement("span");
    span.className = `w${w}`;
    span.appendChild(range.extractContents());
    span.querySelectorAll('span[class^="w"], b, strong').forEach((el) => el.replaceWith(...el.childNodes));
    range.insertNode(span);
    const again = document.createRange();
    again.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(again);
    save();
  };

  // Wrap the selection in a right-aligned span, or unwrap it if it's already inside one.
  const toggleRight = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !ref.current) return;
    const range = sel.getRangeAt(0);
    let node: Node | null = range.commonAncestorContainer;
    while (node && node !== ref.current) {
      if (node instanceof HTMLElement && node.matches("span.r")) {
        node.replaceWith(...node.childNodes);
        save();
        return;
      }
      node = node.parentNode;
    }
    if (range.collapsed || !ref.current.contains(range.commonAncestorContainer)) return;
    const span = document.createElement("span");
    span.className = "r";
    span.appendChild(range.extractContents());
    range.insertNode(span);
    // A float only stays on its own line when it comes first, so move it to the start of the line:
    // out of any bold/font wrappers, then back past the text before it (up to a line break).
    const root = ref.current;
    while (span.parentNode && span.parentNode !== root && !/^(DIV|P)$/.test((span.parentNode as Element).nodeName)) {
      const parent = span.parentNode as Element;
      if (span.previousSibling) parent.after(span);
      else parent.before(span);
      if (span.parentNode === parent) break;
    }
    let prev = span.previousSibling;
    while (prev && prev.nodeName !== "BR" && !(prev instanceof HTMLElement && /^(DIV|P)$/.test(prev.nodeName))) {
      span.after(prev);
      prev = span.previousSibling;
    }
    save();
  };

  return (
    <div className="group/rt relative">
      <div
        className={
          floating
            ? "absolute left-0 top-full z-30 mt-2 hidden w-max max-w-[min(640px,90vw)] flex-wrap items-center gap-1 rounded-xl border border-ink/10 bg-paper p-1 font-sans text-sm font-normal not-italic normal-case tracking-normal shadow-lg group-focus-within/rt:flex"
            : "mb-2 flex flex-wrap items-center gap-1 rounded-xl border border-ink/10 bg-paper p-1 shadow-sm"
        }
      >
        <button type="button" title="Bold" className={`${btn} font-bold`} onMouseDown={cmd("bold")}>B</button>
        <button type="button" title="Italic" className={`${btn} italic`} onMouseDown={cmd("italic")}>I</button>
        <div className="relative">
          <button
            type="button"
            title="Weight of the marked text"
            className={`${btn} ${weightMenu ? "bg-ink text-paper" : ""}`}
            onMouseDown={(e) => {
              e.preventDefault();
              setWeightMenu((v) => !v);
            }}
          >
            Weight ▾
          </button>
          {weightMenu && (
            <div className="absolute left-0 top-full z-40 mt-1 flex flex-col rounded-lg bg-paper p-1 shadow-lg ring-1 ring-ink/10">
              {WEIGHTS.map(([w, name]) => (
                <button key={w} type="button" className={`${btn} justify-start`} style={{ fontWeight: w }} onMouseDown={setWeight(w)}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" title="Sans font" className={btn} onMouseDown={cmd("fontName", "sans")}>Sans</button>
        <button type="button" title="Serif font" className={`${btn} font-serif italic`} onMouseDown={cmd("fontName", "serif")}>Serif</button>
        <button type="button" title="Mono font" className={`${btn} font-mono`} onMouseDown={cmd("fontName", "mono")}>Mono</button>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" title="Extra small" className={`${btn} text-[10px]`} onMouseDown={cmd("fontSize", "1")}>XS</button>
        <button type="button" title="Small" className={`${btn} text-xs`} onMouseDown={cmd("fontSize", "2")}>S</button>
        <button type="button" title="Normal" className={btn} onMouseDown={cmd("fontSize", "3")}>M</button>
        <button type="button" title="Large" className={`${btn} text-base`} onMouseDown={cmd("fontSize", "4")}>L</button>
        <button type="button" title="Extra large" className={`${btn} text-lg`} onMouseDown={cmd("fontSize", "5")}>XL</button>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" title="Dark text" className={`${btn} gap-1.5`} onMouseDown={cmd("foreColor", COLORS.dark)}>
          <span className="h-3 w-3 rounded-full bg-ink" /> Dark
        </button>
        <button type="button" title="Grey text" className={`${btn} gap-1.5`} onMouseDown={cmd("foreColor", COLORS.grey)}>
          <span className="h-3 w-3 rounded-full bg-gray" /> Grey
        </button>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" title="Push the selected text to the right of its line (click again to undo)" className={btn} onMouseDown={toggleRight}>
          → Right
        </button>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" title="Bullet list" className={btn} onMouseDown={cmd("insertUnorderedList")}>• List</button>
        <button type="button" title="Numbered list" className={btn} onMouseDown={cmd("insertOrderedList")}>1. List</button>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <button
          type="button"
          title="Line height, letter spacing and space between lines"
          className={`${btn} ${panel ? "bg-ink text-paper" : ""}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setPanel((p) => !p);
          }}
        >
          ↕ Spacing
        </button>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" title="Clear formatting" className={btn} onMouseDown={cmd("removeFormat")}>Clear</button>
        {panel && (
          <div className="mt-1 flex w-full flex-col gap-2 rounded-lg bg-ink/[0.04] p-3">
            <Slider label="Line height" value={cur.lh} min={1} max={2.4} step={0.05} onChange={(v) => setStyle("lh", v)} />
            <Slider label="Letter spacing" value={cur.ls} min={-0.05} max={0.2} step={0.005} unit="em" onChange={(v) => setStyle("ls", v)} />
            <Slider label="Space between lines" value={cur.gap} min={0} max={1.5} step={0.05} unit="em" onChange={(v) => setStyle("gap", v)} />
            <button type="button" className="self-start text-xs text-gray underline hover:text-ink" onClick={() => putStyle(undefined)}>
              Reset spacing
            </button>
          </div>
        )}
      </div>
      <div
        style={style}
        ref={ref}
        className={`rich editable ${className}`}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        data-placeholder={placeholder}
        onClick={(e) => e.preventDefault()}
        onBlur={save}
      />
    </div>
  );
}

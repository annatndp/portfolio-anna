"use client";

import { useRef } from "react";
import { useContent } from "./ContentProvider";

// Formatted text: bold, italic, 3 fonts, 3 sizes. Stored as a small subset of HTML.
// Only these tags/attributes survive, so pasted or typed markup can't run scripts.
const TAGS = new Set(["b", "strong", "i", "em", "u", "br", "div", "p", "font"]);
const FACES = new Set(["sans", "serif", "mono"]);
const SIZES = new Set(["2", "3", "5"]);

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function sanitizeRich(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (tag, name: string, attrs: string) => {
      const t = name.toLowerCase();
      if (!TAGS.has(t)) return "";
      if (tag.startsWith("</")) return `</${t}>`;
      if (t !== "font") return `<${t}>`;
      const face = attrs.match(/face="([^"]*)"/)?.[1];
      const size = attrs.match(/size="([^"]*)"/)?.[1];
      return `<font${face && FACES.has(face) ? ` face="${face}"` : ""}${size && SIZES.has(size) ? ` size="${size}"` : ""}>`;
    });
}

/** Plain text (older content) becomes HTML with line breaks; HTML is cleaned. */
export function toRichHtml(value: string) {
  return /<[a-z][\s\S]*>/i.test(value) ? sanitizeRich(value) : escapeHtml(value).replace(/\n/g, "<br>");
}

const btn =
  "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm text-ink hover:bg-ink hover:text-paper";

/** Rich text that becomes an editor with a small toolbar in edit mode. */
export function RichT({ path, className = "", placeholder = "Type here…" }: { path: string; className?: string; placeholder?: string }) {
  const { editing, text, setText } = useContent();
  const ref = useRef<HTMLDivElement>(null);
  const value = text(path);
  const html = toRichHtml(value);

  if (!editing) return value ? <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: html }} /> : null;

  const save = () => {
    const next = sanitizeRich(ref.current?.innerHTML ?? "").replace(/(<br>|\s)+$/g, "");
    if (next !== html) setText(path, next);
  };
  // Toolbar buttons keep the text selection (mousedown is cancelled), apply the command, then save.
  const cmd = (name: string, arg?: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(name, false, arg);
    save();
  };

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-1 rounded-xl border border-ink/10 bg-paper p-1 shadow-sm">
        <button type="button" title="Bold" className={`${btn} font-bold`} onMouseDown={cmd("bold")}>B</button>
        <button type="button" title="Italic" className={`${btn} italic`} onMouseDown={cmd("italic")}>I</button>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" title="Sans font" className={btn} onMouseDown={cmd("fontName", "sans")}>Sans</button>
        <button type="button" title="Serif font" className={`${btn} font-serif italic`} onMouseDown={cmd("fontName", "serif")}>Serif</button>
        <button type="button" title="Mono font" className={`${btn} font-mono`} onMouseDown={cmd("fontName", "mono")}>Mono</button>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" title="Small" className={`${btn} text-xs`} onMouseDown={cmd("fontSize", "2")}>S</button>
        <button type="button" title="Normal" className={btn} onMouseDown={cmd("fontSize", "3")}>M</button>
        <button type="button" title="Large" className={`${btn} text-base`} onMouseDown={cmd("fontSize", "5")}>L</button>
        <span className="mx-1 h-5 w-px bg-ink/15" />
        <button type="button" title="Clear formatting" className={btn} onMouseDown={cmd("removeFormat")}>Clear</button>
      </div>
      <div
        key={html}
        ref={ref}
        className={`rich editable ${className}`}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        data-placeholder={placeholder}
        onClick={(e) => e.preventDefault()}
        onBlur={save}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

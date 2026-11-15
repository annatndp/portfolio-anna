"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { emptyImage } from "@/content/defaults";
import { getAt } from "@/lib/path";
import type { Content } from "@/content/types";
import { useContent } from "./ContentProvider";
import { uploadImage } from "./upload";

const stop = (e: React.SyntheticEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

/** Text that turns into an inline editor in edit mode. */
export function T({
  path,
  as: Tag = "span",
  className,
  placeholder = "Type here…",
  multiline = false,
  style,
}: {
  path: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const { editing, text, setText } = useContent();
  const value = text(path);

  if (!editing) return value ? <Tag className={className} style={style}>{value}</Tag> : null;

  return (
    <Tag
      key={value}
      className={`${className ?? ""} editable`}
      style={style}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
      data-placeholder={placeholder}
      onClick={(e: React.MouseEvent) => e.preventDefault()}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") e.currentTarget.blur();
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = e.currentTarget.innerText.replace(/\n+$/, "").trim();
        if (next !== value) setText(path, next);
      }}
    >
      {value}
    </Tag>
  );
}

/** next/image filling its (relative) parent, with Replace / drop-to-upload in edit mode. */
export function EditableImage({
  path,
  alt,
  sizes,
  className = "object-cover",
  priority,
  onRemove,
}: {
  path: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  onRemove?: () => void;
}) {
  const { content, editing, set } = useContent();
  const src = String(getAt(content, path) || emptyImage);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  async function handle(file?: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      set(path, await uploadImage(file));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const img = <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  if (!editing) return img;

  return (
    <>
      {img}
      <div
        className={`absolute inset-0 z-10 transition ${over ? "bg-accent/20 ring-4 ring-inset ring-accent" : ""}`}
        onDragOver={(e) => {
          stop(e);
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          stop(e);
          setOver(false);
          handle(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="absolute left-3 top-3 flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              input.current?.click();
            }}
            className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper shadow hover:bg-accent"
          >
            {busy ? "Uploading…" : "Replace image"}
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                onRemove();
              }}
              className="rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-ink shadow hover:bg-red-600 hover:text-paper"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            handle(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </>
  );
}

/** Keep Norwegian texts attached to the right list item after a move or delete. */
function remapTranslations(d: Content, listPath: string, to: (n: number) => number | null) {
  if (!d.no) return;
  const prefix = `${listPath}.`;
  const next: Record<string, string> = {};
  for (const [key, val] of Object.entries(d.no)) {
    const m = key.startsWith(prefix) ? key.slice(prefix.length).match(/^(\d+)(.*)$/) : null;
    if (!m) {
      next[key] = val;
      continue;
    }
    const n = to(Number(m[1]));
    if (n !== null) next[`${prefix}${n}${m[2]}`] = val;
  }
  d.no = next;
}

/** Small move / delete buttons for an item in a list (edit mode only). */
export function ItemControls({
  listPath,
  index,
  label = "item",
  className = "right-3 top-3",
}: {
  listPath: string;
  index: number;
  label?: string;
  className?: string;
}) {
  const { editing, update } = useContent();
  if (!editing) return null;

  const move = (to: number) =>
    update((d) => {
      const list = getAt(d, listPath) as unknown[];
      if (to < 0 || to >= list.length) return;
      [list[index], list[to]] = [list[to], list[index]];
      remapTranslations(d, listPath, (n) => (n === index ? to : n === to ? index : n));
    });

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full bg-paper text-sm text-ink shadow ring-1 ring-ink/10 hover:bg-ink hover:text-paper";

  return (
    <div className={`absolute z-20 flex gap-1.5 ${className}`}>
      <button type="button" title="Move earlier" className={btn} onClick={(e) => (stop(e), move(index - 1))}>
        ←
      </button>
      <button type="button" title="Move later" className={btn} onClick={(e) => (stop(e), move(index + 1))}>
        →
      </button>
      <button
        type="button"
        title={`Delete ${label}`}
        className={`${btn} hover:!bg-red-600`}
        onClick={(e) => {
          stop(e);
          if (confirm(`Delete this ${label}?`))
            update((d) => {
              (getAt(d, listPath) as unknown[]).splice(index, 1);
              remapTranslations(d, listPath, (n) => (n === index ? null : n > index ? n - 1 : n));
            });
        }}
      >
        ✕
      </button>
    </div>
  );
}

/** Dashed "+ Add …" button shown only in edit mode. */
export function AddButton({
  onClick,
  children,
  className = "",
  style,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { editing } = useContent();
  if (!editing) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/25 p-6 text-sm font-medium text-gray transition hover:border-accent hover:text-accent ${className}`}
    >
      <span className="text-xl leading-none">+</span> {children}
    </button>
  );
}

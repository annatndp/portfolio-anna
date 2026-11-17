"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Content } from "@/content/types";
import { LANG_COOKIE, UI, htmlLang, type Lang, type UiKey } from "@/lib/i18n";
import { getAt, setAt } from "@/lib/path";

type Ctx = {
  content: Content;
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Fixed UI word in the current language. */
  ui: (k: UiKey) => string;
  /** Content text at a path in the current language (Norwegian falls back to English). */
  text: (path: string) => string;
  /** Write content text at a path for the current language. */
  setText: (path: string, value: string) => void;
  editing: boolean;
  dirty: boolean;
  update: (fn: (draft: Content) => void) => void;
  /** Step back / forward through edits (also Cmd+Z / Cmd+Shift+Z). */
  undo: () => void;
  redo: () => void;
  set: (path: string, value: unknown) => void;
  save: () => Promise<void>;
  discard: () => void;
};

const ContentContext = createContext<Ctx | null>(null);

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}

export function ContentProvider({
  initial,
  initialLang,
  children,
}: {
  initial: Content;
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);

  // The edit flag cookie is set by /api/login. Checked after mount so the
  // public page renders identically on server and client.
  useEffect(() => {
    setEditing(document.cookie.split("; ").includes("pf_edit=1"));
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Undo history. Edits that come in quick succession (dragging a slider or a resize handle) count as one step.
  const current = useRef(initial);
  const past = useRef<Content[]>([]);
  const future = useRef<Content[]>([]);
  const lastEdit = useRef(0);

  const show = useCallback((next: Content) => {
    current.current = next;
    setDraft(next);
  }, []);

  const update = useCallback(
    (fn: (d: Content) => void) => {
      const prev = current.current;
      const next = structuredClone(prev);
      fn(next);
      if (JSON.stringify(next) === JSON.stringify(prev)) return;
      const now = Date.now();
      if (now - lastEdit.current > 600 || !past.current.length) {
        past.current.push(prev);
        if (past.current.length > 200) past.current.shift();
      }
      lastEdit.current = now;
      future.current = [];
      show(next);
    },
    [show],
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(current.current);
    lastEdit.current = 0;
    show(prev);
  }, [show]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(current.current);
    lastEdit.current = 0;
    show(next);
  }, [show]);

  // Cmd+Z / Ctrl+Z undo, with Shift (or Ctrl+Y) redo. While typing in a text box the browser's own undo
  // handles the typing; the edit is saved when you click out, and then Cmd+Z undoes it as one step.
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key !== "z" && key !== "y") return;
      const t = e.target as HTMLElement | null;
      if (t?.isContentEditable || (t instanceof HTMLInputElement && /^(text|email|url|search|password|)$/.test(t.type)) || t instanceof HTMLTextAreaElement)
        return;
      e.preventDefault();
      if (key === "y" || e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, undo, redo]);

  const set = useCallback((path: string, value: unknown) => update((d) => setAt(d, path, value)), [update]);

  const save = useCallback(async () => {
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Save failed.");
    setSaved(draft);
    router.refresh();
  }, [draft, router]);

  // Discard can be undone too.
  const discard = useCallback(() => {
    past.current.push(current.current);
    future.current = [];
    lastEdit.current = 0;
    show(saved);
  }, [saved, show]);

  const setLang = useCallback(
    (l: Lang) => {
      document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = htmlLang(l);
      setLangState(l);
      router.refresh(); // updates page titles
    },
    [router],
  );

  const content = editing ? draft : initial;

  const ui = useCallback((k: UiKey) => UI[lang][k], [lang]);

  const text = useCallback(
    (path: string) => {
      const base = String(getAt(content, path) ?? "");
      return lang === "no" ? content.no?.[path] || base : base;
    },
    [content, lang],
  );

  const setText = useCallback(
    (path: string, value: string) =>
      lang === "no" ? update((d) => void (d.no = { ...d.no, [path]: value })) : set(path, value),
    [lang, update, set],
  );

  const value = useMemo<Ctx>(
    () => ({ content, lang, setLang, ui, text, setText, editing, dirty, update, undo, redo, set, save, discard }),
    [content, lang, setLang, ui, text, setText, editing, dirty, update, undo, redo, set, save, discard],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

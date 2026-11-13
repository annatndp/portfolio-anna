"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

  const update = useCallback((fn: (d: Content) => void) => {
    setDraft((d) => {
      const copy = structuredClone(d);
      fn(copy);
      return copy;
    });
  }, []);

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

  const discard = useCallback(() => setDraft(saved), [saved]);

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
    () => ({ content, lang, setLang, ui, text, setText, editing, dirty, update, set, save, discard }),
    [content, lang, setLang, ui, text, setText, editing, dirty, update, set, save, discard],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Content } from "@/content/types";
import { setAt } from "@/lib/path";

type Ctx = {
  content: Content;
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

export function ContentProvider({ initial, children }: { initial: Content; children: React.ReactNode }) {
  const router = useRouter();
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

  const value = useMemo<Ctx>(
    () => ({ content: editing ? draft : initial, editing, dirty, update, set, save, discard }),
    [editing, draft, initial, dirty, update, set, save, discard],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

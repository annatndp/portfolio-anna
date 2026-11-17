"use client";

import { useState } from "react";
import { useContent } from "./ContentProvider";

export function EditBar() {
  const { editing, dirty, save, discard, lang, undo, redo } = useContent();
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  if (!editing) return null;

  async function onSave() {
    setStatus("saving");
    setError("");
    try {
      await save();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setError((e as Error).message);
      setStatus("idle");
    }
  }

  async function onExit() {
    if (dirty && !confirm("You have unsaved changes. Leave edit mode anyway?")) return;
    await fetch("/api/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex flex-wrap items-center gap-2 rounded-full border-2 border-ink bg-paper py-2 pl-5 pr-2 shadow-[4px_4px_0_var(--ink)]">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className={`h-2.5 w-2.5 rounded-full ${dirty ? "bg-orange-500" : "bg-green-500"}`} />
          {error ? <span className="text-red-600">{error}</span> : dirty ? "Unsaved changes" : status === "saved" ? "Saved ✓" : "Edit mode"}
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent" title="Switch language in the menu to edit the other one">
            {lang === "no" ? "Editing: Norsk" : "Editing: English"}
          </span>
        </span>
        <button
          type="button"
          title="Undo (⌘Z)"
          onClick={undo}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-ink/5"
        >
          ↶
        </button>
        <button
          type="button"
          title="Redo (⇧⌘Z)"
          onClick={redo}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-ink/5"
        >
          ↷
        </button>
        <button
          type="button"
          onClick={discard}
          disabled={!dirty}
          className="rounded-full px-4 py-2 text-sm hover:bg-ink/5 disabled:opacity-40"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || status === "saving"}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-accent disabled:opacity-40"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onExit} className="rounded-full px-4 py-2 text-sm text-gray hover:text-ink">
          Exit
        </button>
      </div>
    </div>
  );
}

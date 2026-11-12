"use client";

import { useState } from "react";
import { useContent } from "./ContentProvider";

export function EditBar() {
  const { editing, dirty, save, discard } = useContent();
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
        </span>
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

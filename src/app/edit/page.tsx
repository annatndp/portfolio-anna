"use client";

import { useState } from "react";

export default function EditLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = "/";
      return;
    }
    setError((await res.json().catch(() => ({}))).error || "Login failed.");
    setBusy(false);
  }

  return (
    <section className="flex min-h-[80svh] items-center justify-center px-4 pt-24">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5 text-center">
        <h1 className="font-serif text-6xl italic">Edit mode</h1>
        <p className="text-gray">Enter your password to edit the site.</p>
        <input
          type="password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-full border-2 border-ink px-5 py-3 text-center outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-ink px-6 py-3 font-medium text-paper hover:bg-accent disabled:opacity-60"
        >
          {busy ? "Checking…" : "Start editing"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </section>
  );
}

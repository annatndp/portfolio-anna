"use client";

import { useState } from "react";
import { useContent } from "@/components/edit/ContentProvider";

// Messages go to Formspree, which forwards them to your email.
// Set NEXT_PUBLIC_FORMSPREE_ID (e.g. "xyzabcd") in .env.local and in Vercel.
// Without it, the form opens the visitor's email app instead.
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;

type Status = "idle" | "sending" | "sent" | "error";

const fieldClass =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition focus:border-ink focus:ring-2 focus:ring-accent/30";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const { site } = useContent().content;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("_gotcha")) return; // spam bot filled the hidden field

    if (!FORMSPREE_ID) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${data.get("name")}`);
      const body = encodeURIComponent(`${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`);
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-ink bg-accent-soft p-8 text-center">
        <p className="font-serif text-4xl italic">Thank you!</p>
        <p className="mt-2 text-gray">Your message is on its way. I&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Name</span>
          <input name="name" type="text" required autoComplete="name" className={fieldClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" required autoComplete="email" className={fieldClass} />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Message</span>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Share your thoughts, questions, or project details here."
          className={`${fieldClass} resize-y`}
        />
      </label>
      {/* Honeypot: hidden from people, bots fill it in */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-7 py-3 text-base font-medium text-paper transition hover:-translate-y-0.5 hover:bg-accent hover:border-accent disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Submit"} <span aria-hidden>→</span>
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600">
          Something went wrong. Please email me directly at{" "}
          <a href={`mailto:${site.email}`} className="underline">{site.email}</a>.
        </p>
      )}
    </form>
  );
}

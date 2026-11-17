"use client";

import { useState } from "react";
import { useContent } from "./ContentProvider";

/** A typed web address: "linkedin.com/in/x" gets https:// in front so it doesn't open as a page of this site. */
function fixLink(v: string) {
  const t = v.trim();
  if (!t) return "#";
  return /^(https?:|mailto:|#|\/)/i.test(t) ? t : `https://${t}`;
}

/** Edit mode: button + small box to type the web address of social link i (no browser pop-up, which some browsers block). */
export function SocialLinkInput({ i }: { i: number }) {
  const { content, set } = useContent();
  const [open, setOpen] = useState(false);
  const href = content.site.socials[i]?.href ?? "#";
  const has = !!href && href !== "#";
  return (
    <>
      <button
        type="button"
        title={has ? href : "Add the link"}
        onClick={() => setOpen((v) => !v)}
        className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-xs hover:bg-ink hover:text-paper ${
          open ? "border-ink bg-ink text-paper" : has ? "border-ink/30" : "border-accent text-accent"
        }`}
      >
        {has ? "link ✓" : "+ link"}
      </button>
      {open && (
        <input
          autoFocus
          type="url"
          placeholder="https://…"
          defaultValue={has ? href : ""}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
          }}
          onBlur={(e) => {
            set(`site.socials.${i}.href`, fixLink(e.currentTarget.value));
            setOpen(false);
          }}
          className="absolute left-0 top-full z-30 mt-2 w-72 rounded-lg border border-ink/20 bg-paper px-3 py-2 text-sm text-ink shadow-lg outline-none focus:border-accent"
        />
      )}
    </>
  );
}

/** A social link in the public view. Without a web address yet it is plain text, so it doesn't open this page in a new tab. */
export function SocialLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (!href || href === "#") return <span className={className}>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

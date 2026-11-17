"use client";

import Link from "next/link";
import { AddButton, ItemControls, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";

const linkClass = "inline-block py-2 underline-offset-4 hover:underline";

export function Footer() {
  const { content, editing, set, update, ui } = useContent();
  const { site } = content;

  return (
    <footer className={`border-t-2 border-ink bg-accent-soft ${editing ? "pb-24" : ""}`}>
      <div className="mx-auto flex min-h-40 max-w-[1800px] flex-col justify-between gap-12 px-5 py-14 sm:flex-row sm:px-10 sm:py-20 lg:px-16">
        <div className="flex flex-col justify-between gap-6">
          <span className="font-serif text-lg italic">
            © {new Date().getFullYear()} {site.fullName}
          </span>
        </div>
        <div className="flex gap-16 text-lg">
          <ul>
            {site.socials.map((s, i) => (
              <li key={i} className={editing ? "relative flex items-center gap-2 pr-28" : undefined}>
                {editing ? (
                  <>
                    <T path={`site.socials.${i}.label`} className={linkClass} placeholder="Name" />
                    <button
                      type="button"
                      title={s.href}
                      onClick={() => {
                        const href = prompt(`Link for ${s.label}:`, s.href);
                        if (href !== null) set(`site.socials.${i}.href`, href.trim());
                      }}
                      className="rounded-full border border-ink/30 px-2 py-0.5 text-xs hover:bg-ink hover:text-paper"
                    >
                      link
                    </button>
                    <ItemControls listPath="site.socials" index={i} label="link" className="right-0 top-1/2 -translate-y-1/2 scale-75" />
                  </>
                ) : (
                  <a href={s.href} className={linkClass} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                )}
              </li>
            ))}
            <li>
              <AddButton
                className="mt-2 !p-2"
                onClick={() => update((d) => void d.site.socials.push({ label: "New link", href: "#" }))}
              >
                Add link
              </AddButton>
            </li>
          </ul>
          <ul>
            <li><Link href="/about" className={linkClass}>{ui("about")}</Link></li>
            <li><Link href="/about#contact" className={linkClass}>{ui("contact")}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

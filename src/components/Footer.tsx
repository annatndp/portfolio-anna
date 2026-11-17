"use client";

import Link from "next/link";
import { AddButton, ItemControls, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";
import { SocialLink, SocialLinkInput } from "@/components/edit/SocialLinkInput";

const linkClass = "inline-block py-1 underline-offset-4 hover:underline";

export function Footer() {
  const { content, editing, update, ui } = useContent();
  const { site } = content;

  return (
    // One short row: © name on the left; social links + About / Contact on the right (stacked on phones).
    <footer className={`border-t-2 border-ink bg-accent-soft ${editing ? "pb-24" : ""}`}>
      <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <span className="font-serif text-lg italic">
          © {new Date().getFullYear()} {site.fullName}
        </span>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 text-base">
          {site.socials.map((s, i) => (
            <li key={i} className={editing ? "relative flex items-center gap-2 pr-24" : undefined}>
              {editing ? (
                <>
                  <T path={`site.socials.${i}.label`} className={linkClass} placeholder="Name" />
                  <SocialLinkInput i={i} />
                  <ItemControls listPath="site.socials" index={i} label="link" className="right-0 top-1/2 -translate-y-1/2 scale-75" />
                </>
              ) : (
                <SocialLink href={s.href} className={linkClass}>
                  {s.label}
                </SocialLink>
              )}
            </li>
          ))}
          {editing && (
            <li>
              <AddButton
                className="!p-2"
                onClick={() => update((d) => void d.site.socials.push({ label: "New link", href: "#" }))}
              >
                Add link
              </AddButton>
            </li>
          )}
          <li aria-hidden className="hidden h-4 w-px bg-ink/25 sm:block" />
          <li><Link href="/about" className={linkClass}>{ui("about")}</Link></li>
          <li><Link href="/about#contact" className={linkClass}>{ui("contact")}</Link></li>
        </ul>
      </div>
    </footer>
  );
}

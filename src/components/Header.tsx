"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContent } from "@/components/edit/ContentProvider";

const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { site } = useContent().content;

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      {/* Shared "hand-drawn" wobble filter for the nav ellipses */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <filter id="rough" x="-15%" y="-45%" width="130%" height="190%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
          </filter>
        </defs>
      </svg>

      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-5 py-5 sm:px-10 lg:px-16">
        <Link
          href="/"
          aria-label={`${site.fullName} — home`}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink font-serif text-xl italic transition-transform duration-500 hover:-rotate-12 sm:h-12 sm:w-12"
        >
          {site.fullName
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-5">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const color = active ? "var(--accent)" : "var(--ink)";
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="relative inline-flex items-center justify-center px-3.5 py-2.5 text-base transition-transform hover:-translate-y-0.5 sm:px-8 sm:py-3 sm:text-2xl"
              >
                <svg
                  viewBox="0 0 200 80"
                  preserveAspectRatio="none"
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full [filter:url(#rough)]"
                >
                  <ellipse
                    cx="100"
                    cy="40"
                    rx="96"
                    ry="35"
                    fill="none"
                    stroke={color}
                    strokeWidth={active ? 2 : 1.4}
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <span className="relative font-serif">{item.label}</span>
                {active && (
                  <span className="absolute -bottom-2.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent sm:h-2.5 sm:w-2.5" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

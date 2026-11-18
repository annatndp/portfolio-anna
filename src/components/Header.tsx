"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContent } from "@/components/edit/ContentProvider";

export function Header() {
  const pathname = usePathname();
  const { ui, lang, setLang } = useContent();
  const nav = [
    { href: "/", label: ui("home") },
    { href: "/about", label: ui("about") },
  ];
  const pill =
    "relative inline-flex items-center justify-center px-5 py-3.5 text-[19px] transition-transform hover:-translate-y-0.5 sm:px-8 sm:py-3 sm:text-2xl";
  const Ellipse = ({ color, active }: { color: string; active: boolean }) => (
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
  );

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

      <div className="mx-auto flex max-w-[1800px] items-center justify-end px-5 py-5 sm:px-10 lg:px-16">

        <nav className="flex items-center gap-2 sm:gap-5">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const color = active ? "var(--accent)" : "var(--ink)";
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={pill}
              >
                <Ellipse color={color} active={active} />
                <span className="relative font-serif">{item.label}</span>
                {active && (
                  <span className="absolute -bottom-3 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent sm:-bottom-2.5 sm:h-2.5 sm:w-2.5" />
                )}
              </Link>
            );
          })}
          {/* Language switch: shows the other language's name */}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "no" : "en")}
            aria-label={ui("switchToLabel")}
            title={ui("switchToLabel")}
            className={`${pill} text-accent`}
          >
            <Ellipse color="var(--accent)" active={false} />
            <span className="relative font-serif">{ui("switchTo")}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

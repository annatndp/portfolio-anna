"use client";

import { EditableImage, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Services } from "@/components/Services";

export function HomeView() {
  const { site } = useContent().content;

  return (
    <>
      <section className="flex min-h-svh flex-col items-center justify-center px-5 py-24 sm:px-10 lg:px-16">
        <h1 className="mx-auto max-w-6xl text-center text-5xl font-semibold leading-[1.12] tracking-tight sm:text-7xl lg:text-8xl">
          <span className="font-serif font-normal italic">Hi, I&apos;m </span>
          <span className="relative mx-1 inline-block h-[0.85em] w-[1.5em] translate-y-[0.08em] overflow-hidden rounded-full border-2 border-ink align-baseline">
            <EditableImage path="site.portrait" alt={site.fullName} priority sizes="200px" />
          </span>{" "}
          <T path="site.name" className="font-serif font-normal italic" placeholder="Name" />
          <span className="font-serif font-normal italic">,</span>
          <br />
          <T path="site.role" className="font-serif font-normal italic" placeholder="your role" />{" "}
          <T path="site.tagline" placeholder="what you do" />
        </h1>
        <a
          href="#projects"
          className="mt-14 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink text-xl transition hover:translate-y-1"
          aria-label="See projects"
        >
          ↓
        </a>
      </section>

      <section id="projects" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-10 sm:py-24">
        <div className="mb-10 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <h2 className="text-sm font-medium uppercase tracking-widest text-gray">Projects</h2>
        </div>
        <ProjectGrid />
      </section>

      <Services />
    </>
  );
}

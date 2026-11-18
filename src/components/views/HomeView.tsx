"use client";

import { EditableImage, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";
import { Flower } from "@/components/Flower";
import { HeroCursors } from "@/components/HeroCursors";
import { ProjectGrid } from "@/components/ProjectGrid";

export function HomeView() {
  const { content, ui } = useContent();
  const { site } = content;

  return (
    <>
      <section className="relative flex min-h-svh flex-col items-center justify-center px-5 py-24 sm:px-10 lg:px-16">
        <h1 className="relative z-10 mx-auto max-w-6xl text-center text-5xl font-semibold leading-[1.12] tracking-tight sm:text-7xl lg:text-8xl">
          <T path="site.hi" fallback={ui("hi")} className="font-serif font-normal italic" placeholder="Hi, I'm" />{" "}
          <T path="site.name" className="font-serif font-normal italic" placeholder="Name" />
          <span className="font-serif font-normal italic">,</span>{" "}
          <span className="relative mx-1 inline-block h-[0.85em] w-[1.5em] translate-y-[0.08em] overflow-hidden rounded-full border-2 border-ink align-baseline">
            <EditableImage path="site.portrait" alt={site.fullName} priority sizes="200px" className="object-cover object-[50%_35%]" />
          </span>
          <br />
          <Flower className="mr-3 h-[0.7em] w-[0.7em] -translate-y-[0.06em] cursor-pointer" />
          <T path="site.role" className="font-serif font-normal italic" placeholder="your role" />{" "}
          <T path="site.tagline" placeholder="what you do" />
        </h1>
        <HeroCursors />
        <a
          href="#projects"
          className="relative z-10 mt-14 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-paper text-xl transition hover:translate-y-1"
          aria-label={ui("seeProjects")}
        >
          ↓
        </a>
      </section>

      <section id="projects" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-[1800px] px-5 sm:px-10 lg:px-16">
          <div className="mb-10 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <h2 className="text-sm font-medium uppercase tracking-widest text-gray">{ui("projects")}</h2>
          </div>
          <ProjectGrid />
        </div>
      </section>
    </>
  );
}

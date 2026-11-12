import type { Metadata } from "next";
import { ProjectGrid } from "@/components/ProjectGrid";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-10">
      <h1 className="mb-14 font-serif text-6xl italic sm:text-8xl">Projects</h1>
      <ProjectGrid />
    </section>
  );
}

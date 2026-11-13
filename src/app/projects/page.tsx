import type { Metadata } from "next";
import { uiServer } from "@/lib/lang-server";
import { ProjectGrid } from "@/components/ProjectGrid";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await uiServer("projects") };
}

export default async function ProjectsPage() {
  return (
    <section className="mx-auto max-w-[1800px] px-5 pb-24 pt-32 sm:px-10 lg:px-16">
      <h1 className="mb-14 font-serif text-6xl italic sm:text-8xl">{await uiServer("projects")}</h1>
      <ProjectGrid />
    </section>
  );
}

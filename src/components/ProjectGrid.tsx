"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { newProject } from "@/content/defaults";
import { AddButton, EditableImage, ItemControls, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";

export function ProjectGrid() {
  const { content, update } = useContent();
  const router = useRouter();

  function addProject() {
    const taken = new Set(content.projects.map((p) => p.slug));
    let slug = "new-project";
    for (let n = 2; taken.has(slug); n++) slug = `new-project-${n}`;
    update((d) => void d.projects.push(newProject(slug)));
    router.push(`/projects/${slug}`);
  }

  return (
    <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
      {content.projects.map((p, i) => (
        <Link key={p.slug} href={`/projects/${p.slug}`} className="group relative block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl" style={{ background: p.tint }}>
            <EditableImage
              path={`projects.${i}.cover`}
              alt={p.title}
              sizes="(min-width: 640px) 50vw, 100vw"
              priority={i < 2}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <ItemControls listPath="projects" index={i} label="project" />
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <T path={`projects.${i}.title`} className="font-serif text-2xl italic sm:text-3xl" placeholder="Project title" />
            <span className="text-sm text-gray transition-transform group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </div>
          <T
            path={`projects.${i}.description`}
            as="p"
            className="mt-1 block text-sm leading-relaxed text-gray"
            placeholder="Short description"
          />
        </Link>
      ))}
      <AddButton onClick={addProject} className="aspect-[4/3]">
        Add project
      </AddButton>
    </div>
  );
}

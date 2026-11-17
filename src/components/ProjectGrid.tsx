"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { newProject } from "@/content/defaults";
import { AddButton, EditableImage, ItemControls, T, remapTranslations } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";
import { moveOrder, startPointerDrag } from "@/components/edit/drag";

export function ProjectGrid() {
  const { content, update } = useContent();
  const router = useRouter();
  /** Project being dragged and the project it would take the place of. */
  const [drag, setDrag] = useState<{ from: number; over: number } | null>(null);

  function addProject() {
    const taken = new Set(content.projects.map((p) => p.slug));
    let slug = "new-project";
    for (let n = 2; taken.has(slug); n++) slug = `new-project-${n}`;
    update((d) => void d.projects.push(newProject(slug)));
    router.push(`/projects/${slug}`);
  }

  function dragProject(e: React.PointerEvent, from: number) {
    let over = from;
    startPointerDrag(e, {
      onMove(x, y) {
        const card = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-pi]");
        if (card) over = Number(card.dataset.pi);
        setDrag({ from, over });
      },
      onEnd(cancelled) {
        setDrag(null);
        if (cancelled) return;
        // Take the place of the card it was dropped on.
        const order = moveOrder(content.projects.length, from, from, over > from ? over + 1 : over);
        if (!order) return;
        update((d) => {
          d.projects = order.map((n) => d.projects[n]);
          remapTranslations(d, "projects", (n) => order.indexOf(n));
        });
      },
    });
  }

  return (
    // Two big columns; the right one sits lower so the cards are staggered (like the template).
    // Translating keeps the reading order 1, 2, 3… on mobile, where it's a single column.
    <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 sm:pb-28 lg:gap-x-16 lg:gap-y-24 lg:pb-40">
      {content.projects.map((p, i) => (
        <Link
          key={p.slug}
          href={`/projects/${p.slug}`}
          data-pi={i}
          className={`group relative block transition-opacity ${i % 2 ? "sm:translate-y-28 lg:translate-y-40" : ""} ${
            drag?.from === i ? "opacity-40" : ""
          }`}
        >
          <div
            className={`relative aspect-square overflow-hidden rounded-3xl ${
              drag && drag.over === i && drag.from !== i ? "ring-4 ring-accent ring-offset-4 ring-offset-paper" : ""
            }`}
            style={{ background: p.tint }}
          >
            <EditableImage
              path={`projects.${i}.cover`}
              alt={p.title}
              sizes="(min-width: 640px) 50vw, 100vw"
              priority={i < 2}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <ItemControls listPath="projects" index={i} label="project" onDragStart={(e) => dragProject(e, i)} />
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <T path={`projects.${i}.title`} className="font-serif text-3xl italic sm:text-4xl" placeholder="Project title" />
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
      <AddButton
        onClick={addProject}
        className={`aspect-square ${content.projects.length % 2 ? "sm:translate-y-28 lg:translate-y-40" : ""}`}
      >
        Add project
      </AddButton>
    </div>
  );
}

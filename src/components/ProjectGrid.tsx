"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { emptyImage, newProject } from "@/content/defaults";
import { AddButton, EditableImage, ItemControls, T, remapTranslations } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";
import { moveOrder, startPointerDrag } from "@/components/edit/drag";

export function ProjectGrid() {
  const { content, editing, update, set } = useContent();
  /** Edit mode: cards switched to show (and edit) the hover image instead of the card image. */
  const [showHover, setShowHover] = useState<Record<string, boolean>>({});
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
            {/* The cover (big image of the project page) shows on hover when the card has its own image. */}
            <div
              className={`absolute inset-0 ${
                p.thumb && editing && !showHover[p.slug] ? "pointer-events-none opacity-0" : ""
              }`}
            >
              <EditableImage
                path={`projects.${i}.cover`}
                alt={p.title}
                sizes="(min-width: 640px) 50vw, 100vw"
                priority={i < 2}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            {p.thumb && (
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  editing ? (showHover[p.slug] ? "pointer-events-none opacity-0" : "") : "group-hover:opacity-0"
                }`}
              >
                <EditableImage
                  path={`projects.${i}.thumb`}
                  alt={p.title}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  priority={i < 2}
                  className="object-cover"
                  onRemove={() => set(`projects.${i}.thumb`, undefined)}
                />
              </div>
            )}
            {editing && (
              <div
                className="absolute bottom-3 left-3 z-20 flex rounded-full bg-paper p-1 text-xs font-medium text-ink shadow"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {p.thumb ? (
                  (
                    [
                      [false, "Card image", "The image shown on the card"],
                      [true, "Hover image", "Shown when the pointer is over the card (the big image of the project page)"],
                    ] as const
                  ).map(([hover, label, hint]) => (
                    <button
                      key={label}
                      type="button"
                      title={hint}
                      onClick={() => setShowHover((v) => ({ ...v, [p.slug]: hover }))}
                      className={`rounded-full px-3 py-1.5 ${!!showHover[p.slug] === hover ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"}`}
                    >
                      {label}
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    title="Pick a different image for the card; the current one then shows on hover"
                    onClick={() => {
                      set(`projects.${i}.thumb`, emptyImage);
                      setShowHover((v) => ({ ...v, [p.slug]: false }));
                    }}
                    className="rounded-full px-3 py-1.5 hover:bg-ink hover:text-paper"
                  >
                    + Card image
                  </button>
                )}
              </div>
            )}
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

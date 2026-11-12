"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { emptyImage } from "@/content/defaults";
import { AddButton, EditableImage, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";
import { slugify } from "@/lib/path";

const frame = "relative aspect-[4/3] w-full overflow-hidden rounded-3xl";
const imgSizes = "(min-width: 1280px) 1280px, 100vw";

export function CaseStudyView({ slug }: { slug: string }) {
  const { content, editing, update, set } = useContent();
  const router = useRouter();
  const i = content.projects.findIndex((p) => p.slug === slug);
  const project = content.projects[i];

  if (!project) {
    return (
      <section className="flex min-h-[70svh] flex-col items-center justify-center px-4 text-center">
        <p className="font-serif text-6xl italic">Project not found.</p>
        <Link href="/projects" className="mt-6 underline underline-offset-4">All projects</Link>
      </section>
    );
  }

  const base = `projects.${i}`;
  const meta = (["category", "campaign", "year"] as const).filter((k) => editing || project[k]);

  function changeSlug() {
    const input = prompt("Page link (letters, numbers and dashes):", project.slug);
    if (!input) return;
    const next = slugify(input);
    if (next === project.slug) return;
    if (content.projects.some((p) => p.slug === next)) return alert("Another project already uses that link.");
    set(`${base}.slug`, next);
    router.replace(`/projects/${next}`);
  }

  return (
    <article className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-10 sm:pt-32">
      <Link href="/projects" className="mb-8 inline-flex items-center gap-2 text-sm text-gray transition-colors hover:text-ink">
        <span aria-hidden>←</span>
        <span className="font-serif italic">All projects</span>
      </Link>

      {editing && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-ink/25 p-3 text-sm text-gray">
          <span>Link: /projects/{project.slug}</span>
          <button type="button" onClick={changeSlug} className="rounded-full border border-ink/30 px-3 py-1 hover:bg-ink hover:text-paper">
            Change link
          </button>
          <label className="ml-auto flex items-center gap-2">
            Background
            <input
              type="color"
              value={project.tint}
              onChange={(e) => set(`${base}.tint`, e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-ink/20"
            />
          </label>
        </div>
      )}

      {meta.length > 0 && (
        <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-widest text-gray">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-accent" aria-hidden />
          {meta.map((k, n) => (
            <span key={k} className={n > 0 ? "text-gray/70" : ""}>
              {n > 0 && "· "}
              <T path={`${base}.${k}`} placeholder={k} />
            </span>
          ))}
        </p>
      )}

      <T path={`${base}.title`} as="h1" className="block max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl" placeholder="Project title" />
      <T path={`${base}.description`} as="p" multiline className="mt-5 block max-w-2xl text-lg leading-relaxed text-gray sm:text-xl" placeholder="Describe the project" />

      <div className={`${frame} mt-10`} style={{ background: project.tint }}>
        <EditableImage path={`${base}.cover`} alt={project.title} sizes={imgSizes} priority className="object-contain" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {project.gallery.map((_, g) => (
          <div key={g} className={frame} style={{ background: project.tint }}>
            <EditableImage
              path={`${base}.gallery.${g}`}
              alt={`${project.title} — image ${g + 1}`}
              sizes={imgSizes}
              className="object-contain"
              onRemove={() => update((d) => void d.projects[i].gallery.splice(g, 1))}
            />
          </div>
        ))}
        <AddButton className="aspect-[4/3]" onClick={() => update((d) => void d.projects[i].gallery.push(emptyImage))}>
          Add image
        </AddButton>
      </div>
    </article>
  );
}

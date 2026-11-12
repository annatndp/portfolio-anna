"use client";

import Link from "next/link";
import { emptyImage } from "@/content/defaults";
import { AddButton, EditableImage, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";

// Scattered collage positions/rotations for up to 6 images (desktop only).
const collage = [
  "left-[2%] top-[6%] w-[22%] -rotate-6",
  "right-[4%] top-[2%] w-[20%] rotate-3",
  "left-[8%] bottom-[4%] w-[18%] rotate-6",
  "right-[10%] bottom-[8%] w-[22%] -rotate-3",
  "left-[38%] -top-[4%] w-[14%] rotate-2",
  "left-[44%] -bottom-[6%] w-[14%] -rotate-6",
];

export function AboutView() {
  const { content, editing, update } = useContent();
  const { images } = content.site.about;
  const remove = (i: number) => update((d) => void d.site.about.images.splice(i, 1));

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-32 sm:px-8">
      <div className="relative mx-auto max-w-7xl lg:flex lg:min-h-[760px] lg:items-center lg:justify-center">
        {images.slice(0, 6).map((_, i) => (
          <div
            key={i}
            className={`absolute hidden aspect-[4/3] overflow-hidden rounded-xl border-2 border-ink shadow-[6px_6px_0_var(--ink)] lg:block ${collage[i]} ${editing ? "z-20" : ""}`}
          >
            <EditableImage path={`site.about.images.${i}`} alt="" sizes="25vw" onRemove={() => remove(i)} />
          </div>
        ))}

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <T path="site.about.statement" as="p" multiline className="block text-2xl leading-snug sm:text-3xl" placeholder="A few sentences about you" />
          <p className="mt-6 text-6xl sm:text-8xl">
            <T path="site.about.punchline.0" className="font-semibold tracking-tight" placeholder="Hiring" />{" "}
            <T path="site.about.punchline.1" className="font-serif italic" placeholder="her." />
          </p>
          <Link
            href="/contact"
            className="mt-10 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-ink px-7 py-3 font-medium text-paper transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent"
          >
            Get in touch <span aria-hidden>→</span>
          </Link>
          {images.length < 6 && (
            <AddButton className="mx-auto mt-8" onClick={() => update((d) => void d.site.about.images.push(emptyImage))}>
              Add photo ({images.length}/6)
            </AddButton>
          )}
        </div>

        {/* Mobile: images as a simple grid under the text */}
        <div className="mt-14 grid grid-cols-2 gap-3 lg:hidden">
          {images.slice(0, 4).map((_, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-ink">
              <EditableImage path={`site.about.images.${i}`} alt="" sizes="50vw" onRemove={() => remove(i)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

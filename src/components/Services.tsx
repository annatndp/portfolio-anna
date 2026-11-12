"use client";

import { AddButton, ItemControls, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";

export function Services() {
  const { content, editing, update } = useContent();

  return (
    <section id="services" className="scroll-mt-20 px-4 py-16 sm:py-24">
      <h2 className="mb-12 text-center font-serif text-6xl italic sm:text-7xl">My Services</h2>
      <div className="mx-auto max-w-4xl border-t border-ink">
        {content.site.services.map((s, i) => (
          // In edit mode every item stays open so its text can be edited.
          <details key={i} open={editing || i === 0} className="relative border-b border-ink">
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-6">
              <T path={`site.services.${i}.title`} className="text-4xl font-medium tracking-tight sm:text-5xl" placeholder="Service name" />
              {editing ? (
                <ItemControls listPath="site.services" index={i} label="service" className="relative" />
              ) : (
                <span className="accordion-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink text-xl transition-transform duration-300">
                  +
                </span>
              )}
            </summary>
            <T path={`site.services.${i}.body`} as="p" multiline className="block max-w-xl pb-6 text-base leading-relaxed text-gray" placeholder="Describe the service" />
          </details>
        ))}
        <AddButton
          className="mt-6 w-full"
          onClick={() => update((d) => void d.site.services.push({ title: "New service", body: "" }))}
        >
          Add service
        </AddButton>
      </div>
    </section>
  );
}

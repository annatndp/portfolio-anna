"use client";

import { ContactForm } from "@/components/ContactForm";
import { EditableImage, T } from "@/components/edit/Editable";
import { useContent } from "@/components/edit/ContentProvider";

export function ContactView() {
  const { content, editing } = useContent();
  const { site } = content;

  return (
    <section className="mx-auto grid max-w-6xl gap-14 px-4 pb-24 pt-32 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <T path="site.contactHeading" as="h1" className="block font-serif text-6xl italic leading-[1.05] sm:text-8xl" placeholder="Heading" />
        <div className="relative mt-10 aspect-[3/2] w-full max-w-sm overflow-hidden rounded-2xl border-2 border-ink">
          <EditableImage path="site.portrait" alt={site.fullName} sizes="400px" />
        </div>
        {editing ? (
          <T path="site.email" className="mt-8 inline-block text-xl" placeholder="you@email.com" />
        ) : (
          <a
            href={`mailto:${site.email}`}
            className="mt-8 inline-block text-xl underline decoration-1 underline-offset-4 hover:text-accent"
          >
            {site.email}
          </a>
        )}
      </div>
      <div className="lg:pt-6">
        <ContactForm />
      </div>
    </section>
  );
}

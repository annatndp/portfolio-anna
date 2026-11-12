import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/views/CaseStudyView";
import { isAuthed } from "@/lib/auth";
import { getContent } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getContent()).projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getContent()).projects.find((p) => p.slug === slug);
  return project ? { title: project.title, description: project.description } : {};
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const exists = (await getContent()).projects.some((p) => p.slug === slug);
  // A project added in edit mode has no saved page yet; let the editor see it.
  if (!exists && !(await isAuthed())) notFound();
  return <CaseStudyView slug={slug} />;
}

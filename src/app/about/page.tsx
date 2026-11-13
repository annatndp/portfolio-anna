import type { Metadata } from "next";
import { uiServer } from "@/lib/lang-server";
import { AboutView } from "@/components/views/AboutView";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await uiServer("about") };
}

export default function AboutPage() {
  return <AboutView />;
}

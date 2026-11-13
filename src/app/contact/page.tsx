import type { Metadata } from "next";
import { uiServer } from "@/lib/lang-server";
import { ContactView } from "@/components/views/ContactView";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await uiServer("contact") };
}

export default function ContactPage() {
  return <ContactView />;
}

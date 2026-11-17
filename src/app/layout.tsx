import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentProvider } from "@/components/edit/ContentProvider";
import { EditBar } from "@/components/edit/EditBar";
import { getContent } from "@/lib/store";
import { htmlLang, UI } from "@/lib/i18n";
import { getLang } from "@/lib/lang-server";
import "./globals.css";

// Body text font.
const instrumentSans = Instrument_Sans({ variable: "--font-instrument-sans", subsets: ["latin", "latin-ext"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [{ site, no }, lang] = await Promise.all([getContent(), getLang()]);
  return {
    title: { default: `${site.fullName} — ${UI[lang].role}`, template: `%s — ${site.fullName}` },
    description: (lang === "no" && no["site.description"]) || site.description,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [content, lang] = await Promise.all([getContent(), getLang()]);
  return (
    <html lang={htmlLang(lang)}>
      <body className={`${instrumentSerif.variable} ${instrumentSans.variable} flex min-h-svh flex-col antialiased`}>
        <ContentProvider initial={content} initialLang={lang}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <EditBar />
        </ContentProvider>
      </body>
    </html>
  );
}

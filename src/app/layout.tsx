import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentProvider } from "@/components/edit/ContentProvider";
import { EditBar } from "@/components/edit/EditBar";
import { getContent } from "@/lib/store";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "vietnamese"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return {
    title: { default: `${site.fullName} — Graphic designer`, template: `%s — ${site.fullName}` },
    description: site.description,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getContent();
  return (
    <html lang="en">
      <body className={`${inter.variable} ${instrumentSerif.variable} flex min-h-svh flex-col antialiased`}>
        <ContentProvider initial={content}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <EditBar />
        </ContentProvider>
      </body>
    </html>
  );
}

import Link from "next/link";

import { uiServer } from "@/lib/lang-server";

export default async function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-8xl italic">{await uiServer("notFoundTitle")}</p>
      <p className="mt-4 text-gray">{await uiServer("notFoundBody")}</p>
      <Link href="/" className="mt-8 underline underline-offset-4 hover:text-accent">
        ←
      </Link>
    </section>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-8xl italic">Oops.</p>
      <p className="mt-4 text-gray">This page doesn&apos;t exist.</p>
      <Link href="/" className="mt-8 underline underline-offset-4 hover:text-accent">
        Back to home
      </Link>
    </section>
  );
}

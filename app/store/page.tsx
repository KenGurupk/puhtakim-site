import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteCopy } from "@/content/site-copy";

const copy = siteCopy.pages.store;

export const metadata: Metadata = copy.metadata;

export default function StorePage() {
  return (
    <section className="relative isolate min-h-[78vh] overflow-hidden bg-black px-5 py-24 sm:px-8">
      <Image
        src="/images/store.jpg"
        alt={copy.headline}
        fill
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/72" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(193,18,31,0.22),transparent_28rem)]" />
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-center">
        <p className="text-sm font-black text-blood">{copy.eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight text-white sm:text-7xl">
          {copy.headline}
        </h1>
        <p className="mt-6 max-w-2xl whitespace-pre-line text-lg font-medium leading-8 text-zinc-300">
          {copy.text}
        </p>
        <Link
          href="/events"
          className="mt-9 w-fit bg-blood px-7 py-4 text-base font-black text-white transition hover:bg-white hover:text-black"
        >
          {copy.cta}
        </Link>
      </div>
    </section>
  );
}

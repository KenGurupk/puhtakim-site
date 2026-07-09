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
        src="/drive-assets/store/store-worn-01.jpg"
        alt={copy.headline}
        fill
        sizes="100vw"
        quality={72}
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
          className="motion-button mt-9 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-blood px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] sm:w-fit"
        >
          {copy.cta}
        </Link>
        <div className="mt-10 grid max-w-4xl gap-3 sm:grid-cols-4">
          {[
            { src: "/drive-assets/store/store-cover.jpg", position: "50% 42%" },
            { src: "/drive-assets/store/store-worn-02.jpg", position: "50% 38%" },
            { src: "/drive-assets/store/store-worn-03.jpg", position: "50% 36%" },
            { src: "/drive-assets/store/store-detail.jpg", position: "50% 50%" }
          ].map((item) => (
            <div key={item.src} className="relative min-h-44 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
              <Image
                src={item.src}
                alt={copy.headline}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                quality={70}
                className="object-cover"
                style={{ objectPosition: item.position }}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

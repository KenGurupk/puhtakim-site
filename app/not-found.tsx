import Link from "next/link";

import { siteCopy } from "@/content/site-copy";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-start justify-center px-5 py-24 sm:px-8">
      <p className="text-sm font-black uppercase tracking-[0.32em] text-blood">404</p>
      <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-6xl">
        {siteCopy.pages.notFound.headline}
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
        {siteCopy.pages.notFound.text}
      </p>
      <Link
        href="/"
        className="motion-button mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-blood px-5 py-3 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]"
      >
        {siteCopy.shared.backHome}
      </Link>
    </section>
  );
}

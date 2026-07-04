import type { Metadata } from "next";
import Link from "next/link";

import { siteCopy } from "@/content/site-copy";

const copy = siteCopy.pages.ticketThanks;

export const metadata: Metadata = copy.metadata;

export default function TicketThanksPage() {
  return (
    <section className="grid min-h-[78vh] place-items-center bg-black px-5 py-24 text-center sm:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-black text-blood">PushTakim</p>
        <h1 className="mt-5 text-5xl font-black leading-tight text-white sm:text-7xl">
          {copy.headline}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-8 text-zinc-300">
          {copy.text}
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex bg-blood px-7 py-4 text-base font-black text-white transition hover:bg-white hover:text-black"
        >
          {siteCopy.shared.backHome}
        </Link>
      </div>
    </section>
  );
}

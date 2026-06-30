import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ביגוד ואקססוריז",
  description: "החנות של PushTakim מתחממת לדבר האמיתי."
};

export default function StorePage() {
  return (
    <section className="relative isolate min-h-[78vh] overflow-hidden bg-black px-5 py-24 sm:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(193,18,31,0.22),transparent_28rem)]" />
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col justify-center">
        <p className="text-sm font-black text-blood">ביגוד ואקססוריז</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight text-white sm:text-7xl">
          החנות עדיין מתחממת לדבר האמיתי 🔥
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-zinc-300">
          הדרופים של PushTakim צריכים להרגיש כמו הקהילה עצמה: אמיתיים, חזקים,
          ונולדים מהשטח. כשזה יהיה מוכן, אתם תדעו.
        </p>
        <Link
          href="/events"
          className="mt-9 w-fit bg-blood px-7 py-4 text-base font-black text-white transition hover:bg-white hover:text-black"
        >
          בינתיים, בואו לזוז
        </Link>
      </div>
    </section>
  );
}

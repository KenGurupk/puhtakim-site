import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "נתראה באירוע",
  description: "אישור הצטרפות לאירוע PushTakim."
};

export default function TicketThanksPage() {
  return (
    <section className="grid min-h-[78vh] place-items-center bg-black px-5 py-24 text-center sm:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-black text-blood">PushTakim</p>
        <h1 className="mt-5 text-5xl font-black leading-tight text-white sm:text-7xl">
          נתראה באירוע ❤️‍🔥
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-8 text-zinc-300">
          תביאו נעליים, מים, ראש פתוח, ואנרגיה טובה. כל השאר קורה כשנפגשים.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex bg-blood px-7 py-4 text-base font-black text-white transition hover:bg-white hover:text-black"
        >
          חזרה הביתה
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-start justify-center px-5 py-24 sm:px-8">
      <p className="text-sm font-black uppercase tracking-[0.32em] text-blood">404</p>
      <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-6xl">
        נראה שקפצת רחוק מדי...
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
        זה קורה גם לטובים ביותר. קח נשימה, תחזור הביתה, ונמשיך לזוז משם.
      </p>
      <Link
        href="/"
        className="mt-8 bg-blood px-5 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
      >
        חזרה הביתה
      </Link>
    </section>
  );
}

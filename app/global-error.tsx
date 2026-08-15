"use client";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-black text-white">
        <main className="min-h-screen bg-black px-5 py-24 text-right text-white">
          <section className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-8">
              <p className="text-sm font-black text-blood">PushTakim</p>
              <h1 className="mt-4 text-4xl font-black leading-tight">משהו נתקע בטעינה.</h1>
              <p className="mt-4 text-base font-bold leading-8 text-zinc-300">
                לא איבדנו את הפרטים שלכם — נסו שוב.
              </p>
              <button
                type="button"
                onClick={() => reset()}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-blood px-6 py-3 text-sm font-black text-white"
              >
                טעינה מחדש
              </button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}

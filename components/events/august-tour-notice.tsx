"use client";

export function AugustTourNotice() {
  function scrollToOffer() {
    const target = document.getElementById("event-stops") ?? document.getElementById("tickets");

    if (!target) {
      return;
    }

    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-black px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_20%,rgba(193,18,31,0.22),transparent_28rem),radial-gradient(circle_at_18%_80%,rgba(245,158,11,0.12),transparent_24rem)]" />
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-blood/35 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(193,18,31,0.12)] sm:p-7 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-4xl">
            <p className="text-xs font-black tracking-[0.16em] text-amber-200">המסע ממשיך עכשיו</p>
            <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-4xl">
              נשאר אירוע סיום אחד, והוא מביא את כל הסבב לרגע האחרון.
            </h2>
            <p className="mt-3 text-base font-bold leading-7 text-zinc-200">
              ראשון לציון מחכה עם סדנה, אימון פתוח, אתגרים, פרסים ואתלטים מכל הארץ.
            </p>
            <p className="mt-2 text-sm font-black text-blood">המשיכו לאירוע הסיום ולכרטיסים ↓</p>
          </div>

          <button
            type="button"
            onClick={scrollToOffer}
            className="motion-button mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-blood px-6 py-4 text-center text-base font-black text-white shadow-[0_18px_70px_rgba(193,18,31,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] sm:w-auto lg:mt-0"
          >
            למפגשים ולכרטיסים ↓
          </button>
        </div>
      </div>
    </section>
  );
}

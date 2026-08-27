"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const dismissedKey = "pushtakim-final-event-announcement";

export function FinalEventAnnouncement() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isPrivateArea = pathname.startsWith("/admin") || pathname.startsWith("/checkin") || pathname.startsWith("/payment-success");
    if (isPrivateArea || window.sessionStorage.getItem(dismissedKey)) return;

    const timer = window.setTimeout(() => setIsOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const close = () => {
    window.sessionStorage.setItem(dismissedKey, "dismissed");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="final-event-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="relative my-auto grid w-full max-w-4xl overflow-hidden rounded-3xl border border-blood/60 bg-[#080808] shadow-[0_30px_140px_rgba(193,18,31,0.38)] sm:grid-cols-[0.78fr_1.22fr]">
        <button
          type="button"
          onClick={close}
          aria-label="סגירת ההודעה"
          className="absolute left-3 top-3 z-10 grid size-11 place-items-center rounded-full border border-white/20 bg-black/75 text-2xl font-bold text-white transition hover:bg-white hover:text-black"
        >
          ×
        </button>

        <div className="relative hidden min-h-[31rem] sm:block">
          <Image
            src="/drive-assets/events-posters/calima-final-schedule.jpg"
            alt="לוח הזמנים המלא של אירוע הסיום ב־Calima"
            fill
            sizes="36vw"
            className="object-cover object-center"
          />
        </div>

        <div className="relative flex flex-col justify-center p-6 pt-16 sm:p-10">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(193,18,31,0.28),transparent_19rem)]" />
          <p className="text-sm font-black tracking-[0.18em] text-blood">אירוע הסיום • יום שישי 28.8</p>
          <h2 id="final-event-title" className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
            האירוע האחרון של הטור. אל תפספסו.
          </h2>
          <p className="mt-5 text-lg font-bold leading-8 text-zinc-200">
            Calima ראשון לציון • הלוז עודכן
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-black">
            <span className="rounded-full bg-blood px-4 py-2 text-white">12:00–15:00</span>
            <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-white">3 שעות של תנועה</span>
          </div>
          <p className="mt-5 text-sm font-medium leading-7 text-zinc-300">
            סדנת טריקים חדשים, אימון פתוח, אתגרים זוכי פרסים ומפגש של קהילות מכל הארץ.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              href="/events#tickets"
              onClick={close}
              className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl bg-blood px-5 py-3 text-center text-sm font-black text-white hover:bg-white hover:text-black"
            >
              לכרטיסים
            </Link>
            <Link
              href="/events#final-event-schedule"
              onClick={close}
              className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/5 px-5 py-3 text-center text-sm font-black text-white hover:bg-white hover:text-black"
            >
              ללוז המלא
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

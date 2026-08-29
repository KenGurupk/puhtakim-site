"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const dismissedKey = "pushtakim-post-tour-announcement";

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
      aria-labelledby="post-tour-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="relative my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-blood/60 bg-[#080808] p-6 pt-16 shadow-[0_30px_140px_rgba(193,18,31,0.38)] sm:p-10 sm:pt-16">
        <button
          type="button"
          onClick={close}
          aria-label="סגירת ההודעה"
          className="absolute left-3 top-3 z-10 grid size-11 place-items-center rounded-full border border-white/20 bg-black/75 text-2xl font-bold text-white transition hover:bg-white hover:text-black"
        >
          ×
        </button>

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(193,18,31,0.28),transparent_19rem)]" />
        <p className="text-sm font-black tracking-[0.18em] text-blood">PUSH TOUR 2026 • המסע הושלם ❤️‍🔥</p>
        <h2 id="post-tour-title" className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
          תודה לכל מי שהיה חלק מהמסע הזה.
        </h2>
        <p className="mt-5 text-base font-bold leading-8 text-zinc-200 sm:text-lg">
          ארבעה אולמות, קהילות מכל הארץ, ספונסרים, חסויות, פרסים, מארחים, צוותי צילום וכל מי שעזר להרים, לארגן ולהפוך את הסבב הזה למה שהוא היה.
        </p>
        <p className="mt-5 text-2xl font-black leading-tight text-white">
          זה לא הסוף. רק התחממנו.
        </p>
        <p className="mt-3 text-base font-bold leading-7 text-amber-200">
          כבר עובדים על האירוע הבא שלנו — האירוע השנתי הכי גדול שלנו.
        </p>

        <div className="mt-7">
          <Link
            href="/events#tour-recaps"
            onClick={close}
            className="motion-button inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blood px-5 py-3 text-center text-sm font-black text-white hover:bg-white hover:text-black sm:w-auto"
          >
            לסיכום הטור והרגעים מהדרך
          </Link>
        </div>
      </div>
    </div>
  );
}

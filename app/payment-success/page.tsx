import type { Metadata } from "next";
import Link from "next/link";

import { PaymentSuccessDetails } from "@/components/home/payment-success-details";
import { siteCopy } from "@/content/site-copy";

export const metadata: Metadata = {
  title: "ההרשמה הושלמה",
  description: "תודה שהצטרפתם ל־PushTakim Tour 2026."
};

export default function PaymentSuccessPage() {
  return (
    <section className="relative isolate grid min-h-[78vh] place-items-center overflow-hidden bg-black px-5 py-24 text-center sm:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(193,18,31,0.22),transparent_30rem),linear-gradient(180deg,#050505_0%,#101010_48%,#050505_100%)]" />
      <div className="max-w-3xl">
        <p className="text-sm font-black tracking-[0.16em] text-blood">PushTakim Tour 2026</p>
        <h1 className="mt-5 text-5xl font-black leading-tight text-white sm:text-7xl">
          🎉 ההרשמה הושלמה!
        </h1>
        <p className="mx-auto mt-6 max-w-2xl whitespace-pre-line text-lg font-medium leading-9 text-zinc-300">
          תודה שבחרת להצטרף ל־PushTakim Tour 2026.
          {"\n"}אישור העסקה והמסמך החשבונאי יישלחו בהתאם לפרטים שהזנת ב־Grow.
          {"\n"}לקראת האירוע נשלח אליך את שעת ההתכנסות, המיקום וההנחיות החשובות.
          {"\n"}מחכים לראות אותך על המזרן! 🔥
        </p>

        <p className="mx-auto mt-5 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm font-bold leading-7 text-zinc-400">
          חשוב: העמוד הזה לא מאמת תשלום בעצמו. אישור העסקה הרשמי יישלח מ־Grow לפי פרטי התשלום שהזנת שם.
        </p>

        <PaymentSuccessDetails />

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="motion-button inline-flex min-h-14 items-center justify-center rounded-2xl bg-blood px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]"
          >
            {siteCopy.shared.backHome}
          </Link>
          <a
            href="https://wa.me/972547632268"
            className="motion-button inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.035] px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]"
          >
            צריכים עזרה? דברו איתנו ב־WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

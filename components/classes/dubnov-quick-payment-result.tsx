"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { quickPaymentMonthLabel } from "@/lib/dubnov-quick-payment";

type PaymentResult = { status: string; amount: number; month: string; sessions: number; transactionId?: string; receiptNumber?: string };

export function QuickPaymentResult({ reference, cancelled }: { reference: string; cancelled: boolean }) {
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [message, setMessage] = useState(cancelled ? "לא התקבל עדיין אישור לתשלום. אפשר לבדוק כאן שוב את מצבו." : "ממתינים לאישור התשלום מ־Grow.");
  useEffect(() => {
    let active = true, timer: ReturnType<typeof setTimeout> | undefined, attempts = 0;
    const controller = new AbortController();
    async function poll() {
      try {
        const token = sessionStorage.getItem("pushtakim:quick-payment:" + reference);
        if (!token || !reference) { if (active) setMessage("אפשר לצפות במצב התשלום מהדפדפן שבו הוא נפתח. לבירור פנו לקן־גורו."); return; }
        const response = await fetch("/api/classes/dubnov-kids/quick-payment/status/" + reference, { headers: { Authorization: "Bearer " + token }, cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("status unavailable");
        const data = await response.json() as PaymentResult;
        if (!active) return;
        setResult(data);
        if (data.status === "paid") { setMessage("התשלום אושר. נתראה באימון!"); return; }
        setMessage("התשלום עדיין ממתין לאישור מ־Grow. ההגעה לעמוד הזה אינה אישור לתשלום.");
        if (++attempts < 12) timer = setTimeout(poll, 3000);
      } catch { if (active) setMessage("לא הצלחנו לבדוק את מצב התשלום כרגע. אין צורך לשלם שוב; לבירור פנו לקן־גורו."); }
    }
    poll();
    return () => { active = false; controller.abort(); if (timer) clearTimeout(timer); };
  }, [reference]);
  return <main className="min-h-screen bg-black px-5 py-16 text-white"><section dir="rtl" className="mx-auto max-w-xl rounded-3xl border border-white/15 bg-zinc-950 p-8">
    <h1 className="text-4xl font-black">מצב תשלום לחוג דובנוב</h1><p role="status" className="mt-6 text-xl leading-9">{message}</p>
    {result && <div className="mt-5 grid gap-3 font-bold"><p>{quickPaymentMonthLabel(result.month)} · {result.sessions} אימונים · {result.amount} ₪</p>{result.transactionId && <p>מספר עסקה: {result.transactionId}</p>}{result.receiptNumber && <p>מספר קבלה: {result.receiptNumber}</p>}</div>}
    {reference && <p className="mt-6 break-all text-sm text-zinc-400">אסמכתה לבירור: {reference}</p>}
    <p className="mt-5 font-bold">קן־גורו · 054-763-2268</p><Link href="/classes/dubnov-kids" className="mt-6 block underline">בחזרה לעמוד החוג</Link>
  </section></main>;
}

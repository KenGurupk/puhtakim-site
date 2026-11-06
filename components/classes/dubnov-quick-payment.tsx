"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { quickPaymentMaxSessions, quickPaymentMonthLabel, quickPaymentUnitPrice } from "@/lib/dubnov-quick-payment";

export function QuickPaymentForm({ initialMonth, initialSessions, available }: { initialMonth: string; initialSessions: number; available: boolean }) {
  const [month, setMonth] = useState(initialMonth);
  const [sessions, setSessions] = useState(String(initialSessions));
  const [healthChanged, setHealthChanged] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attempt = useRef<string | null>(null);
  const submitting = useRef(false);
  const count = Number(sessions);
  const validCount = Number.isInteger(count) && count >= 1 && count <= quickPaymentMaxSessions;
  const amount = validCount ? count * quickPaymentUnitPrice : null;
  const inputClass = "min-h-12 rounded-2xl border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-blood";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !available) return;
    setError(null);
    if (!confirmed || !validCount || !quickPaymentMonthLabel(month)) { setError("בחרו חודש ומספר אימונים ואשרו את עדכון הבריאות."); return; }
    const form = new FormData(event.currentTarget);
    // Ensure the status can be read after Grow returns before creating any payment.
    try { sessionStorage.setItem("pushtakim:quick-payment:storage-check", "1"); sessionStorage.removeItem("pushtakim:quick-payment:storage-check"); }
    catch { setError("כדי לעקוב אחר התשלום, אפשרו אחסון בדפדפן ונסו שוב."); return; }
    submitting.current = true; setBusy(true);
    attempt.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/classes/dubnov-kids/quick-payment", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childName: form.get("childName"), guardianPhone: form.get("guardianPhone"), dateOfBirth: form.get("dateOfBirth"), month, sessions: count, healthStatus: healthChanged ? "changed" : "unchanged", healthUpdate: healthChanged ? form.get("healthUpdate") : "", healthConfirmed: confirmed, idempotencyKey: attempt.current })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "לא הצלחנו לפתוח את התשלום.");
      if (payload.amount !== amount) throw new Error("הסכום השתנה. רעננו את הדף לפני התשלום.");
      sessionStorage.setItem("pushtakim:quick-payment:" + payload.checkoutReference, payload.statusAccessToken);
      window.location.assign(payload.paymentUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "לא הצלחנו לפתוח את התשלום. נסו שוב.");
      submitting.current = false; setBusy(false);
    }
  }

  return <main className="min-h-screen bg-black px-5 py-16 text-white">
    <section dir="rtl" className="mx-auto max-w-2xl rounded-3xl border border-blood/40 bg-zinc-950 p-6 sm:p-10">
      <h1 className="text-4xl font-black leading-tight">תשלום מהיר למתאמנים קיימים</h1>
      <p className="mt-4 leading-8 text-zinc-300">חוג הילדים בדובנוב · למשפחות שכבר השלימו הרשמה, הצהרת בריאות ואישור תנאי השתתפות. משלמים על האימונים שבוחרים, בלי למלא שוב את השאלון.</p>
      {!available && <p role="status" className="mt-5 rounded-xl border border-amber-300/40 p-4 text-amber-100">התשלום המהיר עדיין אינו זמין. לפרטים: קן־גורו, 054-763-2268.</p>}
      <form onSubmit={submit} onChange={() => { if (!busy) attempt.current = null; }} className="mt-8 grid gap-5">
        <label className="grid gap-2 font-bold">שם הילד/ה כפי שנרשם<input required name="childName" maxLength={150} autoComplete="off" className={inputClass} /></label>
        <label className="grid gap-2 font-bold">תאריך לידה של הילד/ה<input required type="date" name="dateOfBirth" className={inputClass} /></label>
        <label className="grid gap-2 font-bold">טלפון ההורה שנמסר בהרשמה<input required type="tel" name="guardianPhone" autoComplete="tel" className={inputClass} /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 font-bold">חודש התשלום<input required type="month" value={month} onChange={e => setMonth(e.target.value)} className={inputClass} /></label>
          <label className="grid gap-2 font-bold">מספר אימונים חד־פעמיים<input required type="number" min={1} max={quickPaymentMaxSessions} step={1} value={sessions} onChange={e => setSessions(e.target.value)} className={inputClass} /></label>
        </div>
        <div aria-live="polite" className="rounded-2xl border border-blood/50 bg-blood/10 p-5">
          <p className="font-bold">{quickPaymentMonthLabel(month)}</p>
          <output className="mt-2 block text-3xl font-black">{amount === null ? "בחרו מספר אימונים תקין" : quickPaymentUnitPrice + " ₪ × " + count + " אימונים = " + amount + " ₪"}</output>
        </div>
        <fieldset className="grid gap-4 rounded-2xl border border-white/15 p-5">
          <legend className="px-2 text-lg font-black">עדכון בריאות קצר</legend>
          {healthChanged && <><label className="grid gap-2 font-bold">מה השתנה מאז ההרשמה?<textarea required name="healthUpdate" maxLength={2000} rows={4} className={inputClass} /></label><p className="text-sm leading-7 text-zinc-300">העדכון יישמר לצד ההצהרה המקורית. יש לתאם עם קן־גורו את ההשתתפות בהתאם לשינוי לפני האימון.</p></>}
          <label className="flex items-start gap-3 font-bold leading-7"><input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />{healthChanged ? "אני מאשר/ת שהעדכון הבריאותי שמסרתי נכון ומלא." : "אני מאשר/ת שלא חל שינוי במידע הבריאותי שנמסר בהרשמה."}</label>
          <button type="button" onClick={() => { setHealthChanged(v => !v); setConfirmed(false); }} className="text-right text-sm font-bold underline">{healthChanged ? "לא חל שינוי — חזרה לאישור קצר" : "חל שינוי במידע הבריאותי? לעדכון קצר"}</button>
        </fieldset>
        {error && <p role="alert" className="rounded-xl border border-blood p-4 font-bold">{error}</p>}
        <button disabled={busy || !available || amount === null} className="min-h-14 rounded-2xl bg-blood px-5 py-4 text-xl font-black disabled:opacity-50">{busy ? "פותחים את Grow..." : "לתשלום מאובטח ב־Grow · " + (amount ?? "") + " ₪"}</button>
      </form>
      <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold underline"><Link href="/classes/dubnov-kids">הרשמה ראשונה</Link><Link href="/dubnov">חידוש מנוי חודשי</Link></div>
    </section>
  </main>;
}

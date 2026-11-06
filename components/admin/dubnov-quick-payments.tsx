"use client";

import { useState } from "react";
import type { CheckoutIntent } from "@/lib/checkout-intents";
import { currentQuickPaymentMonth, quickPaymentMonthLabel } from "@/lib/dubnov-quick-payment";

type HealthUpdate = { registrationId: string; healthStatus: "changed" | "unchanged"; healthUpdate: string; healthConfirmedAt: string };

export function DubnovQuickPayments({ purchases, onViewRegistration }: { purchases: CheckoutIntent[]; onViewRegistration: (reference: string) => void }) {
  const [month, setMonth] = useState(currentQuickPaymentMonth);
  const [selected, setSelected] = useState<HealthUpdate | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const payments = purchases.filter(r => r.purchaseKind === "existing_single" && r.classMonth === month);

  async function showHealthUpdate(reference: string) {
    setBusy(reference); setSelected(null); setError(null);
    try {
      const response = await fetch("/api/admin/dubnov-kids/quick-payments/" + reference, { cache: "no-store" });
      if (!response.ok) throw new Error("לא הצלחנו לטעון את עדכון הבריאות.");
      setSelected(await response.json() as HealthUpdate);
    } catch (e) { setError(e instanceof Error ? e.message : "לא הצלחנו לטעון את העדכון."); }
    finally { setBusy(null); }
  }

  return <section dir="rtl" className="mt-8 rounded-3xl border border-blood/40 bg-zinc-950 p-6">
    <h2 className="text-3xl font-black">דובנוב — תשלומים מהירים</h2>
    <label className="mt-5 grid max-w-xs gap-2 font-bold">חודש למעקב<input type="month" value={month} onChange={e => { setMonth(e.target.value); setSelected(null); }} className="min-h-12 rounded-xl border border-white/20 bg-black px-4" /></label>
    <p className="mt-4 text-sm leading-7 text-zinc-400">התשלומים מקושרים לטופס המקורי ומופיעים גם בלוח המכירות הכללי. עדכון בריאות מכיל מידע רגיש ומוצג למנהלים בלבד.</p>
    <div className="mt-5 overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr>{["ילד/ה", "חודש", "אימונים", "סכום", "מצב", "עסקה / קבלה", "טופס ועדכון בריאות"].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>
      {payments.map(r => <tr key={r.checkoutReference} className="border-t border-white/10">
        <td className="p-3">{r.fullName}</td><td className="p-3">{quickPaymentMonthLabel(r.classMonth || "")}</td><td className="p-3">{r.sessionCount}</td><td className="p-3">{r.unitPrice} ₪ × {r.sessionCount} = {r.price} ₪</td>
        <td className="p-3">{r.status === "paid" && r.paymentMatchMethod === "grow-api-process" ? "שולם" : r.status === "failed" ? "נכשל" : r.status === "cancelled" ? "בוטל" : "ממתין"}</td>
        <td className="p-3">{r.growTransactionId || "—"} / {r.growReceiptNumber || "—"}</td><td className="p-3"><button type="button" disabled={Boolean(busy)} onClick={() => showHealthUpdate(r.checkoutReference)} className="font-bold underline">{busy === r.checkoutReference ? "טוענים..." : "צפייה בטופס ובעדכון"}</button></td>
      </tr>)}
    </tbody></table>{!payments.length && <p className="p-3 text-zinc-400">אין תשלומים מהירים לחודש שנבחר.</p>}</div>
    {error && <p role="alert" className="mt-4 text-red-300">{error}</p>}
    {selected && <div className="mt-5 rounded-2xl border border-amber-300/40 p-5">
      <p className="font-black">{selected.healthStatus === "changed" ? "נמסר שינוי במידע הבריאותי — נדרשת בדיקת המאמן לפני האימון" : "ההורה אישר שלא חל שינוי במידע הבריאותי"}</p>
      {selected.healthUpdate && <p className="mt-3 whitespace-pre-wrap leading-8">{selected.healthUpdate}</p>}
      <p className="mt-3 text-sm">מועד האישור: {new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(selected.healthConfirmedAt))}</p>
      <button type="button" onClick={() => onViewRegistration(selected.registrationId)} className="mt-4 font-bold underline">פתיחת ההרשמה וההצהרה המקוריות</button>
      <button type="button" onClick={() => setSelected(null)} className="mr-5 font-bold underline">סגירה</button>
    </div>}
  </section>;
}

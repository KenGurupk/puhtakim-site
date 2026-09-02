"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { dubnovKidsConfig, type DubnovKidsPlan } from "@/lib/dubnov-kids";
import { getUtmParams } from "@/lib/checkout-intents";
import { healthQuestions } from "@/lib/registration-form";

type FormState = {
  childFullName: string; childDateOfBirth: string; guardianFullName: string; guardianPhone: string; email: string;
  emergencyContactName: string; emergencyContactPhone: string; medicalNotes: string;
};

const emptyForm: FormState = { childFullName: "", childDateOfBirth: "", guardianFullName: "", guardianPhone: "", email: "", emergencyContactName: "", emergencyContactPhone: "", medicalNotes: "" };
const latestReferenceKey = "pushtakim.dubnovKids.latestReference";
const planOrder: DubnovKidsPlan[] = ["trial", "single", "monthly"];

export function DubnovKidsRegistration() {
  const [plan, setPlan] = useState<DubnovKidsPlan>("trial");
  const [form, setForm] = useState(emptyForm);
  const [healthAnswers, setHealthAnswers] = useState<Record<string, "yes" | "no">>({});
  const [healthAccepted, setHealthAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [availability, setAvailability] = useState<{
    remaining: number;
    isFull: boolean;
    dropInAvailable: boolean;
    checkoutAvailable: Record<DubnovKidsPlan, boolean>;
  } | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedPlan = dubnovKidsConfig.plans[plan];
  const selectedPlanUnavailable = availability?.isFull || (plan !== "monthly" && availability?.dropInAvailable === false);
  const selectedPlanCheckoutUnavailable = availability?.checkoutAvailable?.[plan] === false;

  useEffect(() => {
    fetch("/api/classes/dubnov-kids/availability", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((value) => value && setAvailability(value))
      .catch(() => undefined);
  }, []);

  const healthComplete = useMemo(() => healthQuestions.every((_, index) => healthAnswers[`q${index + 1}`]), [healthAnswers]);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  async function submit() {
    if (selectedPlanUnavailable) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/classes/dubnov-kids/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan, healthAnswers, healthAccepted, termsAccepted, photoConsent, utm: getUtmParams() })
      });
      const payload = await response.json().catch(() => null) as { checkoutReference?: string; statusAccessToken?: string; paymentUrl?: string; error?: string } | null;
      if (!response.ok || !payload?.checkoutReference || !payload.statusAccessToken || !payload.paymentUrl) throw new Error(payload?.error ?? "לא הצלחנו להכין את ההרשמה לתשלום.");
      window.localStorage.setItem(latestReferenceKey, JSON.stringify({ reference: payload.checkoutReference, token: payload.statusAccessToken }));
      window.location.assign(payload.paymentUrl);
    } catch (submitError) {
      setSaving(false);
      setError(submitError instanceof Error ? submitError.message : "לא הצלחנו להכין את ההרשמה לתשלום.");
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-20 text-white sm:px-6" dir="rtl">
      <div className="mx-auto max-w-3xl">
        <Link href="/workshops" className="mb-5 inline-flex min-h-11 items-center rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-black text-zinc-200 transition hover:border-blood hover:text-white">
          חזרה לסדנאות וחוגים
        </Link>
        <header className="rounded-3xl border border-blood/40 bg-[radial-gradient(circle_at_85%_0%,rgba(193,18,31,0.28),transparent_22rem),#080808] p-6 shadow-[0_24px_100px_rgba(193,18,31,0.16)] sm:p-10">
          <p className="text-sm font-black text-blood">אימון שבועי לילדים בקבוצה קטנה</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">{dubnovKidsConfig.name}</h1>
          <p className="mt-5 text-lg font-bold leading-8 text-zinc-200">מתאים לילדים שרוצים להתחיל לזוז, ללמוד יסודות ולהתקדם בקצב שלהם, עם תהליך מקצועי, בטוח ויחס אישי.</p>
          <div className="mt-6 grid gap-2 text-sm font-black text-zinc-300 sm:grid-cols-3">
            <p>📍 {dubnovKidsConfig.venue}, {dubnovKidsConfig.city}</p><p>📅 {dubnovKidsConfig.weekday}</p><p>🕠 {dubnovKidsConfig.time}</p>
          </div>
        </header>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-zinc-200">
          {!availability && <p>בודקים כמה מקומות נשארו...</p>}
          {availability?.isFull && <p className="text-amber-200">הקבוצה מלאה כרגע. אפשר להצטרף לרשימת ההמתנה.</p>}
          {availability && !availability.isFull && <p>נותרו {availability.remaining} מקומות בקבוצה.</p>}
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
          <h2 className="text-2xl font-black">בחרו איך מתחילים</h2>
          <div className="mt-5 grid gap-3">
            {planOrder.map((planId) => dubnovKidsConfig.plans[planId]).map((item) => (
              <button key={item.id} type="button" aria-pressed={plan === item.id} onClick={() => setPlan(item.id)} className={`relative min-h-48 rounded-2xl border p-5 text-right transition ${plan === item.id ? "border-blood bg-blood/12 shadow-[0_16px_55px_rgba(193,18,31,0.14)]" : "border-white/10 bg-black/30 hover:border-white/30"}`}>
                {item.recommended && <span className="absolute left-4 top-4 rounded-full bg-blood px-3 py-1 text-xs font-black">מומלץ</span>}
                <p className="max-w-[75%] text-xl font-black">{item.name}</p>
                <p className="mt-3 text-4xl font-black text-blood"><span dir="ltr">₪{item.price}</span></p>
                <p className="mt-3 max-w-xl text-sm font-bold leading-6 text-zinc-300">{item.description}</p>
                {availability?.checkoutAvailable?.[item.id] === false && <p className="mt-3 text-sm font-black text-amber-200">ההרשמה למסלול הזה תיפתח בקרוב</p>}
                <span className={`mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2 text-sm font-black ${plan === item.id ? "bg-blood text-white" : "border border-white/20 text-white"}`}>
                  {plan === item.id ? "המסלול נבחר ✓" : "בחירת המסלול"}
                </span>
              </button>
            ))}
          </div>
          {plan === "trial" && <p className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-bold leading-7 text-zinc-300">{dubnovKidsConfig.plans.trial.details}</p>}
          {plan === "monthly" && <p className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-bold leading-7 text-zinc-300">בספטמבר מתוכננים חמישה אימונים: {dubnovKidsConfig.sessionDates.join(", ")}. אין חיוב אוטומטי ואין התחייבות שנתית.</p>}
        </section>

        <section className="mt-6 grid gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
          <h2 className="text-2xl font-black">פרטי הילד וההורה</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="שם מלא של הילד" value={form.childFullName} onChange={(value) => update("childFullName", value)} />
            <Field label="תאריך לידה של הילד" value={form.childDateOfBirth} onChange={(value) => update("childDateOfBirth", value)} type="date" />
            <Field label="שם מלא של הורה או אפוטרופוס" value={form.guardianFullName} onChange={(value) => update("guardianFullName", value)} />
            <Field label="טלפון של ההורה" value={form.guardianPhone} onChange={(value) => update("guardianPhone", value)} inputMode="tel" />
            <Field label="אימייל לקבלת אישור וקבלה" value={form.email} onChange={(value) => update("email", value)} inputMode="email" />
            <Field label="שם איש קשר נוסף לשעת חירום" value={form.emergencyContactName} onChange={(value) => update("emergencyContactName", value)} />
            <Field label="טלפון איש הקשר הנוסף" value={form.emergencyContactPhone} onChange={(value) => update("emergencyContactPhone", value)} inputMode="tel" />
          </div>
          <label className="grid gap-2 text-sm font-bold text-zinc-200">מידע רפואי רלוונטי, אלרגיות, מגבלות או תרופות, אפשר לכתוב ״אין״<textarea value={form.medicalNotes} onChange={(event) => update("medicalNotes", event.target.value)} rows={3} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-blood" /></label>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
          <details className="group"><summary className="cursor-pointer text-xl font-black">הצהרת בריאות, 10 שאלות חובה</summary>
            <div className="mt-5 grid gap-4">{healthQuestions.map((question, index) => { const key = `q${index + 1}`; return <fieldset key={key} className="rounded-2xl border border-white/10 bg-black/30 p-4"><legend className="px-2 text-sm font-bold leading-6">{index + 1}. {question}</legend><div className="mt-3 flex gap-5"><Radio label="לא" checked={healthAnswers[key] === "no"} onChange={() => setHealthAnswers((current) => ({ ...current, [key]: "no" }))} /><Radio label="כן" checked={healthAnswers[key] === "yes"} onChange={() => setHealthAnswers((current) => ({ ...current, [key]: "yes" }))} /></div></fieldset>; })}</div>
          </details>
          <label className="mt-5 flex gap-3 text-sm font-bold leading-6"><input type="checkbox" checked={healthAccepted} disabled={!healthComplete} onChange={(event) => setHealthAccepted(event.target.checked)} className="mt-1 size-5 accent-[#c1121f]" /><span>אני מאשר/ת שהפרטים בהצהרת הבריאות נכונים ומלאים. במקרה של שינוי אעדכן את הצוות לפני הפעילות.</span></label>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
          <h2 className="text-xl font-black">כללי השתתפות ותשלום</h2>
          <ul className="mt-4 grid gap-2 text-sm font-bold leading-6 text-zinc-300"><li>• היעדרות אישית אינה מזכה בהחזר או באימון השלמה.</li><li>• אימון שמבוטל על ידי המארגן יזכה בהשלמה או בזיכוי.</li><li>• ביטול עקב הנחיה רשמית, מצב ביטחוני או מזג אוויר יטופל בהשלמה או בזיכוי בהתאם למקרה.</li><li>• אין הוראת קבע ואין התחייבות שנתית.</li><li>• המקום נשמר רק לאחר אימות התשלום.</li></ul>
          <label className="mt-5 flex gap-3 text-sm font-bold leading-6"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 size-5 accent-[#c1121f]" /><span>קראתי את התקציר ואת תנאי ההשתתפות הקיימים באתר, ואני מאשר/ת את השתתפות הילד.</span></label>
          <label className="mt-4 flex gap-3 text-sm font-bold leading-6 text-zinc-300"><input type="checkbox" checked={photoConsent} onChange={(event) => setPhotoConsent(event.target.checked)} className="mt-1 size-5 accent-[#c1121f]" /><span>אני מסכים/ה לצילום ולשימוש בתמונות או בסרטונים לצורכי תיעוד ופרסום. בחירה זו אינה חובה.</span></label>
        </section>

        {selectedPlanUnavailable ? <div className="mt-6 rounded-3xl border border-amber-300/40 bg-amber-300/10 p-6 text-center"><p className="text-2xl font-black text-amber-100">{availability?.isFull ? "הקבוצה מלאה" : "המקום האחרון שמור למנוי חודשי"}</p><a href="https://wa.me/972547632268" className="mt-4 inline-flex rounded-xl bg-white px-5 py-3 font-black text-black">ליצירת קשר ורשימת המתנה</a></div> : selectedPlanCheckoutUnavailable ? (
          <div className="mt-6 rounded-3xl border border-amber-300/40 bg-amber-300/10 p-6 text-center">
            <p className="text-xl font-black text-amber-100">ההרשמה למסלול הזה תיפתח בקרוב</p>
            <p className="mt-2 text-sm font-bold text-zinc-300">כרגע אפשר להירשם ולשלם עבור אימון ההיכרות המורחב.</p>
          </div>
        ) : (
          <button type="button" onClick={submit} disabled={saving || !healthComplete || !healthAccepted || !termsAccepted} className="mt-6 min-h-16 w-full rounded-2xl bg-blood px-6 py-4 text-lg font-black shadow-[0_20px_70px_rgba(193,18,31,0.3)] disabled:cursor-not-allowed disabled:opacity-45">{saving ? "מכינים את התשלום..." : `לתשלום מאובטח ב־Grow · ₪${selectedPlan.price}`}</button>
        )}
        {error && <p className="mt-4 rounded-2xl border border-blood/50 bg-blood/10 p-4 text-sm font-black">{error}</p>}
        <p className="mt-7 text-center text-sm font-bold text-zinc-500">לשאלות: {dubnovKidsConfig.contactName} · <a href="tel:0547632268" dir="ltr">{dubnovKidsConfig.contactPhone}</a></p>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", inputMode }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: "tel" | "email" }) {
  return <label className="grid gap-2 text-sm font-bold text-zinc-200">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} inputMode={inputMode} max={type === "date" ? new Date().toISOString().slice(0, 10) : undefined} className="min-h-12 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-blood" /></label>;
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="flex cursor-pointer items-center gap-2 text-sm font-black"><input type="radio" checked={checked} onChange={onChange} className="size-5 accent-[#c1121f]" />{label}</label>;
}

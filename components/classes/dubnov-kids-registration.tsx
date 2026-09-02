"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { getUtmParams } from "@/lib/checkout-intents";
import { dubnovKidsConfig, type DubnovKidsPlan } from "@/lib/dubnov-kids";
import { healthQuestions } from "@/lib/registration-form";

type Availability = { remaining: number; isFull: boolean; dropInAvailable: boolean; checkoutAvailable: Record<DubnovKidsPlan, boolean> };
type Answer = "yes" | "no" | "";

export function DubnovKidsRegistration() {
  const [plan, setPlan] = useState<DubnovKidsPlan>("trial");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [answers, setAnswers] = useState<Answer[]>(healthQuestions.map(() => ""));
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetch("/api/classes/dubnov-kids/availability", { cache: "no-store" }).then((r) => r.json()).then(setAvailability).catch(() => setAvailability(null)); }, []);
  const selected = dubnovKidsConfig.plans[plan];
  const hasMedicalFlag = useMemo(() => answers.some((answer) => answer === "yes"), [answers]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    if (answers.some((answer) => !answer)) { setError("רק עוד רגע קטן 🙂 סמנו כן או לא בכל שאלות הבריאות."); return; }
    if (!termsAccepted) { setError("כדי להמשיך צריך לאשר שקראתם את תנאי ההשתתפות והצהרת הבריאות."); return; }
    const form = new FormData(event.currentTarget);
    const medicalNotes = String(form.get("medicalNotes") ?? "").trim();
    if (hasMedicalFlag && !medicalNotes) { setError("סימנתם ״כן״ באחת משאלות הבריאות. כתבו לנו בכמה מילים מה חשוב שנדע לפני האימון."); return; }
    setIsSubmitting(true); const now = new Date().toISOString();
    try {
      const response = await fetch("/api/classes/dubnov-kids/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, fullName: form.get("fullName"), dateOfBirth: form.get("dateOfBirth"), guardianName: form.get("guardianName"), guardianPhone: form.get("guardianPhone"), phone: form.get("phone"), email: form.get("email"), emergencyContactName: form.get("emergencyContactName"), emergencyContactPhone: form.get("emergencyContactPhone"), medicalNotes, compliance: { healthDeclarationCompleted: true, requiresMedicalApproval: hasMedicalFlag, healthDeclarationVersion: "dubnov-kids-2026-09-short-v1", healthDeclarationAcceptedAt: now, healthDeclarationStatus: hasMedicalFlag ? "medical-review-required" : "completed", healthAnswers: Object.fromEntries(answers.map((answer, index) => [`q${index + 1}`, answer])), termsAccepted: true, termsVersion: "dubnov-kids-2026-09-v1", termsAcceptedAt: now, termsDocumentRead: true, participantName: form.get("fullName"), participantDateOfBirth: form.get("dateOfBirth"), isMinor: true, guardianConsent: true, guardianName: form.get("guardianName"), guardianPhone: form.get("guardianPhone"), approverRole: "guardian", photoConsent: photoConsent ? "approved" : "declined" }, utm: getUtmParams() }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "לא הצלחנו לפתוח את התשלום.");
      localStorage.setItem("pushtakim:dubnov-kids:latest-reference", payload.checkoutReference); localStorage.setItem("pushtakim:dubnov-kids:status-token", payload.statusAccessToken); window.location.assign(payload.paymentUrl);
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : "משהו השתבש. נסו שוב."); setIsSubmitting(false); }
  }

  return <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6"><div className="mx-auto max-w-4xl" dir="rtl">
    <section className="rounded-[2rem] border border-blood/60 bg-[radial-gradient(circle_at_90%_0%,rgba(193,18,31,.22),transparent_35%),#050505] p-6 sm:p-10"><p className="font-black text-blood">אימון שבועי לילדים בקבוצה קטנה</p><h1 className="mt-4 text-5xl font-black leading-tight sm:text-7xl">חוג תנועה ופארקור לילדים</h1><p className="mt-5 max-w-2xl text-xl font-bold leading-9 text-zinc-300">מתאים לילדים שרוצים להתחיל לזוז, ללמוד יסודות ולהתקדם בקצב שלהם, עם תהליך מקצועי, בטוח ויחס אישי.</p><div className="mt-6 grid gap-2 text-lg font-black"><p>📍 {dubnovKidsConfig.venue}, {dubnovKidsConfig.city}</p><p>📅 {dubnovKidsConfig.weekday}</p><p>🕔 {dubnovKidsConfig.time}</p></div></section>
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-zinc-950 p-5 sm:p-8"><h2 className="text-4xl font-black">בחרו איך מתחילים</h2><div className="mt-6 grid gap-4">{(["trial","single","monthly"] as DubnovKidsPlan[]).map((id) => { const item=dubnovKidsConfig.plans[id]; const disabled=availability ? !availability.checkoutAvailable[id] || availability.isFull || (id!=="monthly"&&!availability.dropInAvailable) : false; return <button key={id} type="button" disabled={disabled} onClick={()=>setPlan(id)} className={`rounded-3xl border p-6 text-right transition ${plan===id?"border-blood bg-blood/10":"border-white/15 bg-black"} disabled:opacity-45`}><span className="text-3xl font-black">{item.name}</span><span className="mt-2 block text-5xl font-black text-blood">₪{item.price}</span><span className="mt-3 block font-bold leading-7 text-zinc-300">{item.description}</span>{item.details&&<span className="mt-2 block text-sm font-bold text-zinc-400">{item.details}</span>}</button>; })}</div></section>
    <form onSubmit={submit} className="mt-8 grid gap-6"><Card title="מי מגיע לאימון?" subtitle="כמה פרטים כדי שנכיר ונוכל לשמור על קשר."><Fields /></Card>
      <Card title="בריאות ובטיחות" subtitle="קצר ולעניין 🙂 חשוב לנו לדעת רק מה שיכול להשפיע על אימון בטוח ומתאים."><div className="grid gap-4">{healthQuestions.map((question,index)=><div key={question} className="rounded-2xl border border-white/10 bg-black/40 p-4"><p className="font-bold leading-7">{index+1}. {question}</p><div className="mt-3 flex gap-6">{(["no","yes"] as const).map(value=><label key={value} className="flex items-center gap-2 font-black"><input type="radio" name={`health-${index}`} checked={answers[index]===value} onChange={()=>setAnswers(current=>current.map((answer,i)=>i===index?value:answer))} className="h-5 w-5" />{value==="yes"?"כן":"לא"}</label>)}</div></div>)}</div><label className="mt-5 grid gap-2 font-black">פציעות עבר, ניתוחים, מגבלות או כל מידע רפואי אחר שיכול להשפיע על אופי האימון:<textarea name="medicalNotes" rows={4} placeholder="אם אין משהו רלוונטי, אפשר להשאיר ריק. אם סימנתם כן למעלה, ספרו לנו בקצרה מה חשוב שנדע 🙂" className="rounded-2xl border border-white/15 bg-black p-4 font-bold outline-none focus:border-blood" /></label><p className="mt-3 text-sm font-bold leading-6 text-zinc-400">אם עולה משהו שדורש בירור, פשוט נדבר איתכם לפני הפעילות ונבין יחד מה נכון. המטרה היא להתאים את האימון, לא להפחיד 😉</p></Card>
      <Card title="כללי השתתפות ותשלום" subtitle="כמה דברים פשוטים כדי שכולנו נדע איך זה עובד."><ul className="grid list-disc gap-2 pr-5 font-bold leading-7 text-zinc-300"><li>היעדרות אישית אינה מזכה בהחזר או באימון השלמה.</li><li>אימון שמבוטל על ידי המארגן יזכה בהשלמה או בזיכוי.</li><li>ביטול עקב הנחיה רשמית, מצב ביטחוני או מזג אוויר יטופל בהשלמה או בזיכוי בהתאם למקרה.</li><li>אין הוראת קבע ואין התחייבות שנתית.</li><li>המקום בקבוצה נשמר לאחר אימות התשלום.</li></ul><label className="mt-5 flex items-start gap-3 font-black leading-7"><input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} className="mt-1 h-6 w-6 shrink-0" />קראתי את הצהרת הבריאות ואת תנאי ההשתתפות, הפרטים שמסרתי נכונים ומלאים, ואני מאשר/ת את השתתפות הילד/ה בפעילות.</label><label className="mt-4 flex items-start gap-3 font-bold leading-7 text-zinc-300"><input type="checkbox" checked={photoConsent} onChange={e=>setPhotoConsent(e.target.checked)} className="mt-1 h-6 w-6 shrink-0" />אני מסכים/ה לצילום ולשימוש בתמונות או בסרטונים לצורכי תיעוד ופרסום. בחירה זו אינה חובה.</label></Card>
      {error&&<div className="rounded-2xl border border-blood bg-blood/10 p-4 font-black">{error}</div>}<button disabled={isSubmitting||availability?.isFull} className="min-h-16 rounded-2xl bg-blood px-6 text-2xl font-black disabled:opacity-50">{isSubmitting?"פותחים את Grow...":`לתשלום מאובטח ב־Grow · ₪${selected.price}`}</button><p className="pb-8 text-center font-bold text-zinc-500">לשאלות: קן־גורו · {dubnovKidsConfig.contactPhone}</p>
    </form></div></main>;
}

function Card({title,subtitle,children}:{title:string;subtitle?:string;children:ReactNode}){return <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-5 sm:p-8"><h2 className="text-3xl font-black">{title}</h2>{subtitle&&<p className="mt-2 font-bold leading-7 text-zinc-400">{subtitle}</p>}<div className="mt-5">{children}</div></section>}
function Fields(){const input="min-h-12 rounded-2xl border border-white/15 bg-black px-4 py-3 font-bold outline-none focus:border-blood";return <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 font-black">שם הילד/ה<input required name="fullName" className={input}/></label><label className="grid gap-2 font-black">תאריך לידה<input required type="date" name="dateOfBirth" className={input}/></label><label className="grid gap-2 font-black">שם הורה / אפוטרופוס<input required name="guardianName" className={input}/></label><label className="grid gap-2 font-black">טלפון הורה<input required type="tel" name="guardianPhone" className={input}/></label><label className="grid gap-2 font-black">טלפון ליצירת קשר<input required type="tel" name="phone" className={input}/></label><label className="grid gap-2 font-black">אימייל<input required type="email" name="email" className={input}/></label><label className="grid gap-2 font-black">איש קשר לחירום<input required name="emergencyContactName" className={input}/></label><label className="grid gap-2 font-black">טלפון חירום<input required type="tel" name="emergencyContactPhone" className={input}/></label></div>}

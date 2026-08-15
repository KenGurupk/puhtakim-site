"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { checkoutConfig } from "@/lib/checkout-config";

const healthQuestions = [
  "האם רופא אמר לך בעבר שיש לך בעיה בלב או שמותר לך לבצע פעילות גופנית רק תחת פיקוח או הגבלה רפואית?",
  "האם במהלך פעילות גופנית או במנוחה חווית כאב או לחץ בחזה, דפיקות לב חריגות, קוצר נשימה חריג או תחושת עילפון?",
  "האם איבדת הכרה או כמעט איבדת הכרה במהלך פעילות גופנית או בעקבותיה?",
  "האם קיימת אצלך מחלה, פציעה, מגבלה גופנית או מצב רפואי העלולים להחמיר כתוצאה מפעילות גופנית?",
  "האם בשלושת החודשים האחרונים חווית פציעה משמעותית, ניתוח, שבר, פריקה או נזק למפרק, לשריר, לגיד, לרצועה, לראש או לעמוד השדרה?",
  "האם קיימת מגבלה בשיווי המשקל, סחרחורת חוזרת או קושי שעלול להגדיל את הסיכון לנפילה?",
  "האם יש לך אסתמה, קושי נשימתי משמעותי או צורך במשאף בזמן מאמץ?",
  "האם קיימת אלרגיה חמורה, רגישות רפואית משמעותית או צורך לשאת תרופה דחופה כגון מזרק אפינפרין?",
  "האם את בהיריון, או שקיים מצב אחר שבגללו הומלץ לך להתייעץ עם רופא לפני פעילות גופנית?",
  "האם קיימת סיבה רפואית אחרת שבגללה אינך בטוח/ה שנכון לך להשתתף בפעילות?"
] as const;

const termsSections = [
  {
    title: "אופי הפעילות",
    text: "הפעילות עשויה לכלול אימון פתוח, סדנאות, ריצה, קפיצה, טיפוס, נחיתות, תרגילי כוח, שיווי משקל, פארקור, פריראן, אקרובטיקה, טריקינג, קליסטניקס ופעילויות תנועה נוספות."
  },
  {
    title: "אחריות אישית",
    text: "אני מתחייב/ת לפעול בהתאם ליכולת, לניסיון ולמצב הבריאותי שלי, לבקש עזרה במקרה של ספק, לציית להנחיות הצוות ולהפסיק פעילות במקרה של כאב או תחושה מדאיגה."
  },
  {
    title: "סיכונים טבעיים",
    text: "ידוע לי שתנועה ופעילות גופנית כוללות סיכונים טבעיים כגון נפילה, החלקה, עומס, התנגשות או פציעה, גם כאשר ניתנות הנחיות וננקטים אמצעי זהירות."
  },
  {
    title: "צילום ותיעוד",
    text: "במהלך האירוע עשויים להתבצע צילום וידאו וסטילס לצורכי תיעוד ופרסום פעילות PushTakim. מי שאינו מעוניין להופיע בצילומים יעדכן את הצוות בתחילת האירוע."
  },
  {
    title: "קטינים",
    text: "משתתף/ת שטרם מלאו לו/ה 18 שנים רשאי/ת להשתתף רק לאחר אישור הורה או אפוטרופוס חוקי."
  }
] as const;

type HealthAnswer = "yes" | "no";
type HealthAnswers = Record<number, HealthAnswer | undefined>;

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  guardianName: string;
  guardianPhone: string;
};

const emptyForm: FormState = {
  fullName: "",
  phone: "",
  email: "",
  dateOfBirth: "",
  guardianName: "",
  guardianPhone: ""
};

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function CheckinForm() {
  const event = checkoutConfig.events[0];
  const [form, setForm] = useState<FormState>(emptyForm);
  const [healthAnswers, setHealthAnswers] = useState<HealthAnswers>({});
  const [healthAccepted, setHealthAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ reference: string; requiresMedicalApproval: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const termsButtonRef = useRef<HTMLButtonElement>(null);
  const termsDialogRef = useRef<HTMLDivElement>(null);
  const savedScrollYRef = useRef(0);
  const [isMounted, setIsMounted] = useState(false);

  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);
  const isMinor = typeof age === "number" && age < 18;
  const answeredAllHealth = healthQuestions.every((_, index) => healthAnswers[index] === "yes" || healthAnswers[index] === "no");
  const requiresMedicalApproval = Object.values(healthAnswers).some((answer) => answer === "yes");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!termsOpen) {
      return;
    }

    savedScrollYRef.current = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollYRef.current}px`;
    document.body.style.width = "100%";

    window.setTimeout(() => {
      termsDialogRef.current?.querySelector<HTMLButtonElement>("[data-terms-close]")?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeTerms();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, savedScrollYRef.current);
    };
  }, [termsOpen]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function answerHealthQuestion(index: number, answer: HealthAnswer) {
    setHealthAnswers((current) => ({ ...current, [index]: answer }));
    setError("");
  }

  function closeTerms() {
    setTermsOpen(false);
    window.setTimeout(() => termsButtonRef.current?.focus(), 0);
  }

  function validate() {
    if (!form.fullName.trim()) {
      return "צריך למלא שם מלא.";
    }

    if (!form.phone.trim()) {
      return "צריך למלא מספר טלפון.";
    }

    if (!form.dateOfBirth) {
      return "צריך למלא תאריך לידה.";
    }

    if (form.dateOfBirth > getTodayDateString()) {
      return "תאריך הלידה לא יכול להיות בעתיד.";
    }

    if (!answeredAllHealth || !healthAccepted) {
      return "צריך להשלים ולאשר את הצהרת הבריאות.";
    }

    if (!termsRead || !termsAccepted) {
      return "צריך לפתוח ולאשר את תנאי ההשתתפות.";
    }

    if (isMinor && (!form.guardianName.trim() || !form.guardianPhone.trim() || !guardianConsent)) {
      return "משתתף קטין חייב פרטי הורה או אפוטרופוס ואישור השתתפות.";
    }

    return "";
  }

  async function submitCheckin() {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          email: form.email.trim(),
          healthAnswers: Object.fromEntries(
            healthQuestions.map((_, index) => [`q${index + 1}`, healthAnswers[index]]).filter(([, answer]) => answer === "yes" || answer === "no")
          ),
          healthDeclarationAccepted: healthAccepted,
          termsAccepted,
          guardianConsent
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | { checkoutReference?: string; requiresMedicalApproval?: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.checkoutReference) {
        throw new Error(payload?.error ?? "לא הצלחנו לשמור את ההרשמה.");
      }

      setSuccess({
        reference: payload.checkoutReference,
        requiresMedicalApproval: Boolean(payload.requiresMedicalApproval)
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "לא הצלחנו לשמור את ההרשמה. נסו שוב.");
    } finally {
      setIsSaving(false);
    }
  }

  const termsModal =
    termsOpen && isMounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-black/82 px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-5"
            role="presentation"
          >
            <div
              ref={termsDialogRef}
              className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080808] text-right shadow-[0_30px_120px_rgba(0,0,0,0.65)] sm:max-h-[min(48rem,calc(100vh-3rem))]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="checkin-terms-title"
              dir="rtl"
            >
              <div className="shrink-0 border-b border-white/10 p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black tracking-[0.08em] text-blood">PushTakim</p>
                    <h3 id="checkin-terms-title" className="mt-3 text-3xl font-black leading-tight text-white">
                      תנאי השתתפות בפעילות
                    </h3>
                  </div>
                  <button
                    data-terms-close
                    type="button"
                    onClick={closeTerms}
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-xl font-black text-white transition hover:bg-white hover:text-black"
                    aria-label="סגירת תנאי ההשתתפות"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto p-5 sm:p-7">
                <div className="grid gap-5">
                  {termsSections.map((section) => (
                    <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                      <h4 className="text-xl font-black text-white">{section.title}</h4>
                      <p className="mt-3 text-sm font-bold leading-7 text-zinc-300">{section.text}</p>
                    </section>
                  ))}
                </div>
              </div>
              <div className="shrink-0 border-t border-white/10 bg-[#080808] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
                <button
                  type="button"
                  onClick={() => {
                    setTermsRead(true);
                    setTermsAccepted(true);
                    closeTerms();
                  }}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blood px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
                >
                  קראתי ואני מאשר/ת
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  if (success) {
    return (
      <section className="relative isolate min-h-[78vh] bg-black px-5 py-24 text-white sm:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_10%,rgba(193,18,31,0.28),transparent_30rem),linear-gradient(180deg,#050505,#101010_55%,#050505)]" />
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.055] p-6 text-center shadow-[0_30px_110px_rgba(0,0,0,0.4)] sm:p-10">
          <p className="text-sm font-black tracking-[0.16em] text-blood">PushTakim Check-in</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">ההרשמה נשמרה</h1>
          <p className="mt-5 text-lg font-bold leading-8 text-zinc-200">
            אפשר לגשת לעמדת התשלום במקום. הרשומה נשמרה כ-Pending Cash.
          </p>
          {success.requiresMedicalApproval && (
            <p className="mt-5 rounded-2xl border border-amber-300/35 bg-amber-300/10 p-4 text-sm font-black leading-7 text-amber-100">
              לפי אחת התשובות, ייתכן שנבקש אישור רפואי לפני ההשתתפות.
            </p>
          )}
          <p className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-black text-white" dir="ltr">
            {success.reference}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate bg-black px-5 py-20 text-white sm:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_8%,rgba(193,18,31,0.24),transparent_28rem),linear-gradient(180deg,#050505_0%,#111_48%,#050505_100%)]" />
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.42)] sm:p-8">
          <p className="text-sm font-black tracking-[0.16em] text-blood">PushTakim Check-in</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">צ׳ק-אין לאירוע</h1>
          <p className="mt-4 text-base font-bold leading-8 text-zinc-300">
            טופס קצר למשתתפים שמשלמים במקום, מצטרפים בכניסה או צריכים להשלים אישורים לפני הפעילות.
          </p>
          {event && (
            <p className="mt-5 rounded-2xl border border-blood/35 bg-blood/10 p-4 text-sm font-black leading-7 text-white">
              {event.city} / {event.venue} / <span dir="ltr">{event.date}</span>
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-7">
          <h2 className="text-3xl font-black">פרטי משתתף</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="שם מלא" value={form.fullName} onChange={(value) => updateField("fullName", value)} autoComplete="name" />
            <Field label="טלפון" value={form.phone} onChange={(value) => updateField("phone", value)} autoComplete="tel" inputMode="tel" dir="ltr" />
            <Field label="אימייל (לא חובה)" value={form.email} onChange={(value) => updateField("email", value)} autoComplete="email" inputMode="email" dir="ltr" />
            <Field
              label="תאריך לידה"
              type="date"
              value={form.dateOfBirth}
              onChange={(value) => updateField("dateOfBirth", value)}
              max={getTodayDateString()}
              dir="ltr"
            />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black">הצהרת בריאות</h2>
              <p className="mt-2 text-sm font-bold text-zinc-400">
                ענו על כל השאלות. המידע נשמר רק לצורך התאמה בסיסית ובטיחות המשתתפים.
              </p>
            </div>
            <p className="text-sm font-black text-blood">
              נענו {Object.values(healthAnswers).filter(Boolean).length} מתוך {healthQuestions.length}
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {healthQuestions.map((question, index) => (
              <div key={question} className="rounded-2xl border border-white/10 bg-black/28 p-4">
                <p className="text-sm font-black leading-7 text-white">
                  {index + 1}. {question}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(["no", "yes"] as const).map((answer) => {
                    const active = healthAnswers[index] === answer;

                    return (
                      <button
                        key={answer}
                        type="button"
                        onClick={() => answerHealthQuestion(index, answer)}
                        className={`min-h-12 rounded-2xl border px-4 py-3 text-sm font-black transition ${
                          active
                            ? "border-blood bg-blood text-white shadow-[0_0_28px_rgba(193,18,31,0.22)]"
                            : "border-white/10 bg-white/[0.035] text-zinc-200 hover:border-blood/55"
                        }`}
                      >
                        {answer === "no" ? "לא" : "כן"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {answeredAllHealth && requiresMedicalApproval && (
            <p className="mt-5 rounded-2xl border border-amber-300/35 bg-amber-300/10 p-4 text-sm font-black leading-7 text-amber-100">
              סימנת תשובה שכדאי לבדוק לפני ההשתתפות. זה לא בהכרח אומר שלא ניתן להשתתף, אבל ייתכן שנבקש אישור רפואי לפני הפעילות.
            </p>
          )}

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-black leading-7 text-white">
            <input
              type="checkbox"
              checked={healthAccepted}
              onChange={(event) => setHealthAccepted(event.target.checked)}
              className="mt-1 size-5 shrink-0 accent-[#c1121f]"
            />
            <span>אני מאשר/ת שהמידע שמסרתי נכון ומלא למיטב ידיעתי.</span>
          </label>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-7">
          <h2 className="text-3xl font-black">תנאי השתתפות</h2>
          <p className="mt-2 text-sm font-bold leading-7 text-zinc-400">
            פתחו את התנאים, קראו ואשרו לפני שמירת הצ׳ק-אין.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <button
              ref={termsButtonRef}
              type="button"
              onClick={() => setTermsOpen(true)}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-blood/45 bg-blood/12 px-5 py-3 text-sm font-black text-white transition hover:bg-blood"
            >
              לקריאת תנאי ההשתתפות
            </button>
            <p className="text-sm font-black text-zinc-300">{termsRead ? "התנאים נפתחו ונקראו ✓" : "עדיין לא נפתח"}</p>
          </div>
          <label className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 text-sm font-black leading-7 transition ${termsRead ? "cursor-pointer border-white/10 bg-black/30 text-white" : "cursor-not-allowed border-white/10 bg-black/20 text-zinc-500"}`}>
            <input
              type="checkbox"
              checked={termsAccepted}
              disabled={!termsRead}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="mt-1 size-5 shrink-0 accent-[#c1121f] disabled:opacity-40"
            />
            <span>קראתי ואני מאשר/ת את תנאי ההשתתפות.</span>
          </label>
        </div>

        {isMinor && (
          <div className="mt-6 rounded-3xl border border-amber-300/25 bg-amber-300/10 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-7">
            <h2 className="text-3xl font-black">אישור הורה או אפוטרופוס</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="שם מלא של הורה/אפוטרופוס" value={form.guardianName} onChange={(value) => updateField("guardianName", value)} />
              <Field label="טלפון הורה/אפוטרופוס" value={form.guardianPhone} onChange={(value) => updateField("guardianPhone", value)} inputMode="tel" dir="ltr" />
            </div>
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm font-black leading-7 text-white">
              <input
                type="checkbox"
                checked={guardianConsent}
                onChange={(event) => setGuardianConsent(event.target.checked)}
                className="mt-1 size-5 shrink-0 accent-[#c1121f]"
              />
              <span>אני הורה או אפוטרופוס חוקי של המשתתף/ת, קראתי את המסמכים ואני מאשר/ת את השתתפותו/ה.</span>
            </label>
          </div>
        )}

        {error && <p className="mt-6 rounded-2xl border border-blood/45 bg-blood/10 p-4 text-sm font-black leading-7 text-white">{error}</p>}

        <button
          type="button"
          onClick={submitCheckin}
          disabled={isSaving}
          className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-blood px-6 py-4 text-base font-black text-white shadow-[0_18px_70px_rgba(193,18,31,0.24)] transition hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          {isSaving ? "שומרים את הצ׳ק-אין..." : "שמירת צ׳ק-אין"}
        </button>
      </div>

      {termsModal}
      {false && termsOpen && (
        <div className="fixed inset-0 z-[80] bg-black/82 px-3 py-3 backdrop-blur-sm sm:px-5 sm:py-6" role="presentation">
          <div
            className="mx-auto flex h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080808] text-right shadow-[0_30px_120px_rgba(0,0,0,0.65)] sm:h-[min(48rem,calc(100vh-3rem))]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkin-terms-title"
            dir="rtl"
          >
            <div className="shrink-0 border-b border-white/10 p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black tracking-[0.08em] text-blood">PushTakim</p>
                  <h3 id="checkin-terms-title" className="mt-3 text-3xl font-black leading-tight text-white">
                    תנאי השתתפות בפעילות
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeTerms}
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-xl font-black text-white transition hover:bg-white hover:text-black"
                  aria-label="סגירת תנאי ההשתתפות"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
              <div className="grid gap-5">
                {termsSections.map((section) => (
                  <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <h4 className="text-xl font-black text-white">{section.title}</h4>
                    <p className="mt-3 text-sm font-bold leading-7 text-zinc-300">{section.text}</p>
                  </section>
                ))}
              </div>
            </div>
            <div className="shrink-0 border-t border-white/10 bg-[#080808] p-4 sm:p-5">
              <button
                type="button"
                onClick={() => {
                  setTermsRead(true);
                  closeTerms();
                }}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blood px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
              >
                קראתי והבנתי
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  max,
  dir
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "tel";
  max?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-zinc-200">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        max={max}
        dir={dir}
        className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
      />
    </label>
  );
}

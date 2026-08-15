"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";

type SubmissionType = "material" | "idea";

const submissionLabels: Record<SubmissionType, string> = {
  material: "בגד / חומר לתת חיים חדשים",
  idea: "רעיון לעיצוב / שדרוג"
};

const submissionCopy: Record<SubmissionType, { heading: string; placeholder: string }> = {
  material: {
    heading: "בגד שמגיע לו עוד סיבוב",
    placeholder: "ספרו לנו בקצרה מה זה, מה המצב שלו ולמה לא הצלחתם לזרוק אותו :)"
  },
  idea: {
    heading: "רעיון שאתם רוצים לראות במציאות",
    placeholder: "ספרו לנו את הרעיון, הסיפור או הטוויסט שלכם."
  }
};

const whatsappNumber = "972547632268";

export function AliramParticipation() {
  const [submissionType, setSubmissionType] = useState<SubmissionType>("material");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [status, setStatus] = useState<"idle" | "prepared">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  function chooseType(type: SubmissionType) {
    setSubmissionType(type);
    setStatus("idle");
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();

    const message = [
      "היי PushTakim / ALIRAM,",
      `סוג פנייה: ${submissionLabels[submissionType]}`,
      `שם: ${name}`,
      `טלפון / WhatsApp: ${phone}`,
      email ? `אימייל: ${email}` : "",
      "",
      description,
      selectedFileName ? `\nיש לי תמונה לצרף: ${selectedFileName}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setStatus("prepared");
  }

  return (
    <section className="border-b border-white/10 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-black tracking-[0.16em] text-blood">ALIRAM / יצירה מחדש בתנועה</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">
              לא מייצרים דרופים.
              <br />
              יוצרים אותם מחדש.
            </h2>
          </div>

          <div className="grid gap-4 text-base font-bold leading-8 text-zinc-300 sm:text-lg">
            <p>כמו בפארקור, גם כאן אנחנו מסתכלים על מה שכבר קיים ומוצאים דרך חדשה להשתמש בו.</p>
            <p>בגדים ובדים ישנים מקבלים אצלנו חיים חדשים בידיים של יוצר שהוא גם אתלט מתוך הקהילה שלנו.</p>
            <p>כל פריט נבנה מחדש, נתפר ועוצב ביד. לכן כל אחד הוא ONE OF ONE.</p>
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-white">
              <p>אין ייצור המוני.</p>
              <p>אין שניים בדיוק אותו דבר.</p>
              <p>יש פריט אחד, סיפור אחד, ורגע אחד לתפוס אותו.</p>
            </div>
            <p className="text-sm font-black text-amber-200">פחות לזרוק. יותר ליצור מחדש. ♻️</p>
          </div>
        </div>

        <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_24px_90px_rgba(0,0,0,0.34)] sm:mt-16 lg:aspect-[21/8]">
          <Image
            src="/drive-assets/store/store-worn-02.jpg"
            alt="פריט ALIRAM על אתלט מתוך הקהילה"
            fill
            sizes="(min-width: 1024px) 1100px, 100vw"
            quality={75}
            className="object-cover"
            style={{ objectPosition: "50% 28%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/8 to-black/18" />
          <p className="absolute bottom-5 right-5 rounded-full border border-white/14 bg-black/70 px-4 py-2 text-xs font-black tracking-[0.12em] text-white">
            ONE OF ONE
          </p>
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <h3 className="text-3xl font-black leading-tight text-white sm:text-5xl">
              רוצים להיות חלק ממה שיבוא אחר כך?
            </h3>
            <p className="mt-4 text-base font-bold leading-7 text-zinc-300 sm:text-lg">
              יש שתי דרכים ממש פשוטות להכניס משהו משלכם לעולם של ALIRAM.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-black/34 p-5 sm:p-7">
              <h4 className="text-2xl font-black leading-tight text-white">יש לכם בגד שממש אהבתם אבל כבר לא מתאים?</h4>
              <div className="mt-4 grid gap-3 text-sm font-bold leading-7 text-zinc-300 sm:text-base">
                <p>או משהו שנקרע ופשוט לא הצלחתם לזרוק?</p>
                <p>במקום שיישאר בארון, אפשר להעביר אותו אלינו.</p>
                <p>אנחנו אוהבים לקחת דברים ישנים, לפרק, לחבר ולתת להם חיים חדשים.</p>
                <p>אולי עוד תראו אותו חוזר בצורה שלא דמיינתם 👀</p>
                <p className="text-xs font-black leading-6 text-zinc-500">
                  תעבירו כי בא לכם לתת לבגד עוד סיבוב. אם החומרים שלכם ימצאו את הדרך לפרויקטים שלנו, אנחנו כבר נדאג לפרגן בחזרה לאורך הדרך ;)
                </p>
                <p className="text-sm font-black text-amber-200">פחות לזרוק. יותר ליצור מחדש. ♻️</p>
              </div>
              <button
                type="button"
                onClick={() => chooseType("material")}
                className="motion-button mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blood px-5 py-3 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] sm:w-fit"
              >
                יש לי בגד לתת ♻️
              </button>
            </article>

            <article className="rounded-3xl border border-white/10 bg-black/34 p-5 sm:p-7">
              <h4 className="text-2xl font-black leading-tight text-white">יש לכם רעיון יצירתי משלכם?</h4>
              <div className="mt-4 grid gap-3 text-sm font-bold leading-7 text-zinc-300 sm:text-base">
                <p>בגד, פריט, שדרוג או משהו שהייתם מתים לראות במציאות?</p>
                <p>שלחו לנו תמונה, השראה, סקיצה, או פשוט ספרו לנו את הרעיון והסיפור שלכם.</p>
                <p>אולי זה בדיוק משהו שיתחבר אלינו, ונוכל לעזור לכם להפוך אותו למשהו אמיתי.</p>
                <p className="text-xs font-black leading-6 text-zinc-500">
                  לא כל רעיון בהכרח ייצא לפועל. זה תלוי ברעיון, בחומר, בכמות העבודה ובעיקר בחיבור של היוצר לפרויקט.
                </p>
              </div>
              <button
                type="button"
                onClick={() => chooseType("idea")}
                className="motion-button mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blood px-5 py-3 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] sm:w-fit"
              >
                יש לי רעיון ✍️
              </button>
            </article>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="mt-8 grid gap-5 rounded-3xl border border-white/10 bg-black/44 p-5 sm:p-7">
            <div>
              <p className="text-sm font-black tracking-[0.14em] text-blood">פנייה ל-ALIRAM</p>
              <h4 className="mt-2 text-2xl font-black text-white">יש לכם בגד ישן או רעיון חדש?</h4>
              <p className="mt-2 text-sm font-bold leading-6 text-zinc-400">
                ספרו לנו מה בא לכם לחדש, לשדרג או ליצור.
              </p>
              <p className="mt-2 text-xs font-black text-zinc-500">{submissionCopy[submissionType].heading}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                שם מלא
                <input name="name" required autoComplete="name" className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-blood" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                טלפון / WhatsApp
                <input name="phone" required autoComplete="tel" inputMode="tel" dir="ltr" className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-blood" />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                אימייל אופציונלי
                <input name="email" type="email" autoComplete="email" dir="ltr" className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-blood" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                סוג פנייה
                <select
                  value={submissionType}
                  onChange={(event) => {
                    setSubmissionType(event.target.value as SubmissionType);
                    setStatus("idle");
                  }}
                  className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-blood"
                >
                  <option value="material">{submissionLabels.material}</option>
                  <option value="idea">{submissionLabels.idea}</option>
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-bold text-zinc-200">
              תיאור קצר
              <textarea
                name="description"
                required
                rows={5}
                placeholder={submissionCopy[submissionType].placeholder}
                className="resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blood"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-zinc-200">
              יש תמונה? תראו לנו 📸
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setSelectedFileName(event.currentTarget.files?.[0]?.name ?? "")}
                className="rounded-2xl border border-dashed border-white/14 bg-black/50 px-4 py-3 text-sm text-zinc-300 file:ml-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-black file:text-black"
              />
              <span className="text-xs font-bold leading-5 text-zinc-500">
                העלאת קובץ מלאה דורשת חיבור אחסון. כרגע נפתח WhatsApp עם הפרטים, ואת התמונה אפשר לצרף שם.
              </span>
            </label>

            <button
              type="submit"
              className="motion-button inline-flex min-h-13 w-full items-center justify-center rounded-2xl bg-blood px-6 py-4 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] sm:w-fit"
            >
              שלחו לנו
            </button>

            {status === "prepared" && (
              <p className="rounded-2xl border border-amber-200/30 bg-amber-200/10 px-4 py-3 text-sm font-bold leading-6 text-amber-100">
                פתחנו לכם הודעת WhatsApp מוכנה. רק בדקו שהכול נראה נכון ושלחו משם.
              </p>
            )}
          </form>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-center sm:p-7">
            <p className="text-2xl font-black leading-tight text-white">את הפריטים שלנו תוכלו לפגוש גם בדוכנים של Push Tour.</p>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-bold leading-7 text-zinc-300 sm:text-base">
              חלקם כפרסים באתגרים, חלקם למכירה, וחלקם פשוט מופיעים פעם אחת ונעלמים.
            </p>
            <a
              href="/events#event-stops"
              className="motion-button mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-blood/60 px-5 py-3 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-blood active:scale-[0.98] sm:w-fit"
            >
              למפגשי Push Tour ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

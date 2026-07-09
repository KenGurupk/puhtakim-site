import Link from "next/link";

import { CountUpStat } from "@/components/motion/count-up-stat";
import { Reveal } from "@/components/motion/reveal";

const stats = [
  { label: "משתתפים", value: 200, suffix: "+" },
  { label: "אתלטים", value: 120, suffix: "+" },
  { label: "סדנאות", value: 2 },
  { label: "שותפים", textValue: "כולם" }
];

const timeline = [
  {
    title: "לא חיכינו שמישהו אחר ירים את זה",
    text: "אחרי כמעט שנתיים בלי אליפות פארקור בישראל, הבנו שאם זה חשוב לנו, אנחנו צריכים להרים את זה."
  },
  {
    title: "פתחנו מקום לכולם",
    text: "הבאנו את הדור החדש, הזמנו את ה-OG’s, בנינו מתחם, פתחנו סדנאות ונתנו במה לכל מי שהיה צריך רגע להיכנס למעגל."
  },
  {
    title: "יותר מתחרות",
    text: "MOVE לא היה רק תחרות. ילדים מהחוגים, מאמנים, ותיקים, משפחות ויוצרים זזו באותו מרחב והרגישו שוב שיש כאן קהילה."
  },
  {
    title: "ג׳אם גדול, ואז גמר",
    text: "גם בתחרות התחלנו מהקהילה: כולם זזים יחד, כמו ג׳אם גדול, ורק אחר כך הטובים ביותר עלו לסולו בגמר."
  },
  {
    title: "לחבר, להרים, להזכיר",
    text: "המטרה לא הייתה רק לבחור מנצחים. המטרה הייתה לחבר, להרים, ולהזכיר לכולנו למה הקהילה הזאת קיימת."
  }
];

export function MoveShowcase() {
  return (
    <section
      id="move"
      className="relative isolate overflow-hidden border-y border-white/10 bg-[#070707] px-5 py-28 sm:px-8 sm:py-36 lg:py-44"
    >
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_12%,rgba(193,18,31,0.24),transparent_32rem),radial-gradient(circle_at_12%_72%,rgba(255,255,255,0.08),transparent_24rem),linear-gradient(180deg,#050505_0%,#101010_48%,#050505_100%)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:gap-20">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.36em] text-blood" dir="ltr">
                MOVE
              </p>
              <h2 className="mt-6 text-5xl font-black leading-none tracking-tight text-white sm:text-7xl lg:text-8xl">
                הפרויקט הכי גדול שלנו עד היום.
              </h2>
            </div>
            <div className="max-w-3xl">
              <p className="text-2xl font-black leading-10 text-white sm:text-3xl">
                ביום ההוא החלטנו לקחת את הקהילה צעד אחד קדימה.
              </p>
              <p className="mt-7 text-lg font-medium leading-9 text-zinc-300">
                אחרי כמעט שנתיים בלי אליפות פארקור בישראל, החלטנו שלא מחכים שמישהו אחר ירים את זה.
                MOVE נולד כדי להחזיר את הדור החדש, ה-OG’s, המאמנים, המשפחות והיוצרים לאותו מרחב, ולהזכיר למה התחלנו לזוז ביחד.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="mt-16 text-center text-sm font-black tracking-[0.24em] text-blood">
            באירוע אחד בלבד
          </p>
        </Reveal>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.05}>
              <CountUpStat {...item} delay={index * 90} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-6 text-center text-sm font-medium text-zinc-400">
            Based on one two-day community event.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <Reveal>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div
                  key={item.title}
                  className="relative rounded-2xl border border-white/10 bg-black/28 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:bg-white/[0.045]"
                >
                  <div className="mb-5 flex items-center gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-blood/60 bg-blood/14 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <h3 className="text-2xl font-black leading-tight text-white">{item.title}</h3>
                  </div>
                  <p className="text-base font-medium leading-8 text-zinc-300">{item.text}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
              <div className="relative aspect-video bg-[radial-gradient(circle_at_50%_38%,rgba(193,18,31,0.24),transparent_13rem),linear-gradient(145deg,#151515_0%,#050505_58%,#190608_100%)]">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/LbwiqjiaQa0"
                  title="סרטון ההיילייט של MOVE"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.28em] text-blood">רגעים מהיום הזה</p>
                <h3 className="mt-4 text-3xl font-black leading-tight text-white">MOVE על המסך</h3>
                <p className="mt-4 text-base font-medium leading-8 text-zinc-300">
                  צאו מהקופסה.
                </p>
                <Link
                  href="https://youtu.be/LbwiqjiaQa0"
                  className="motion-button mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/25 bg-white/8 px-6 py-3 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-black active:scale-[0.98] sm:w-auto"
                >
                  צפו בסרטון MOVE
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";

const tourStops = [
  {
    id: "push-tour-mabuza",
    stop: "STOP 1",
    city: "פתח תקווה",
    date: "03.08",
    time: "18:00-20:00",
    venue: "Mabuza",
    address: "דב לויטן 8, פתח תקווה"
  },
  {
    id: "push-tour-raiz",
    stop: "STOP 2",
    city: "מודיעין",
    date: "14.08",
    time: "12:00-14:00",
    venue: "Raiz Gym",
    address: "מתתיהו הכהן 5, מודיעין"
  },
  {
    id: "push-tour-pk-spot",
    stop: "STOP 3",
    city: "באר שבע",
    date: "16.08",
    time: "10:00-12:00 Community Skill Round / 12:00-13:00 Break / 13:00-15:00 Final + Open Gym",
    venue: "PK Spot",
    address: "מבצע יואב 49, באר שבע"
  },
  {
    id: "push-tour-calima",
    stop: "STOP 4",
    city: "ראשון לציון",
    date: "28.08",
    time: "10:30-13:00",
    venue: "Calima",
    address: "הכשרת היישוב 10, ראשון לציון"
  }
];

const takeaways = [
  "🤝 חברים חדשים",
  "🧠 דרך חדשה להסתכל על תנועה",
  "🏃 סקילים, רעיונות ואתגר חדש",
  "❤️ קהילה שתמיד תשמח לראות אתכם שוב"
];

const everythingElse = [
  { title: "קהילה", href: "/community" },
  { title: "אירועים ומפגשים", href: "/events" },
  { title: "סדנאות וחוגים", href: "/workshops" },
  { title: "מופעים ופעלולים", href: "/shows" },
  { title: "פרויקטים", href: "/productions" },
  { title: "ביגוד ואקססוריז — ייפתח בקרוב", href: "/store" },
  { title: "מדריכים חינמיים", href: "#guides" },
  { title: "צור קשר", href: "#contact" }
];

export default function HomePage() {
  return (
    <main className="bg-black text-bone">
      <section className="relative isolate min-h-screen overflow-hidden">
        <Image
          src="/pushtakim-hero-photo.png"
          alt="קהילת תנועה של PushTakim מתאמנת יחד ברגע דוקומנטרי"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/46" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.58)_43%,rgba(0,0,0,0.16)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0)_40%,rgba(0,0,0,0.62)_100%)]" />
        <div className="absolute right-6 top-[44%] h-56 w-56 -translate-y-1/2 rounded-full bg-blood/22 blur-[100px] sm:h-96 sm:w-96" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-28 pt-32 sm:px-8 lg:pb-32 lg:pt-36">
          <Reveal>
            <div className="relative max-w-4xl py-10">
              <div className="absolute -right-10 top-0 -z-10 h-72 w-80 rounded-full bg-blood/24 blur-[95px]" aria-hidden="true" />
              <p className="text-sm font-black uppercase tracking-[0.36em] text-white/70 sm:text-base" dir="ltr">
                PushTakim
              </p>
              <h1 className="mt-8 text-5xl font-black leading-[1.03] tracking-tight text-white sm:text-7xl lg:text-8xl">
                לא משנה מאיפה באתם.
              </h1>
              <p className="mt-8 max-w-3xl text-3xl font-black leading-tight text-white sm:text-5xl">
                אם אתם אוהבים לזוז —
                <br />
                באתם למקום הנכון.
              </p>
              <p className="mt-8 text-2xl font-black text-white/88 sm:text-3xl">
                בואו נזוז ביחד.
              </p>

              <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  href="/community"
                  className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-blood px-6 py-4 text-center text-base font-black text-white shadow-[0_20px_80px_rgba(193,18,31,0.32)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black sm:w-auto"
                >
                  ❤️‍🔥 בואו להרים את התנועה בישראל
                </Link>
                <Link
                  href="/events"
                  className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-white/35 bg-black/24 px-6 py-4 text-center text-base font-black text-white backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-black sm:w-auto"
                >
                  🎟️ לאירועים הקרובים
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
          <p className="animate-pulse text-sm font-bold text-white/56">גללו למטה ↓</p>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
          <Reveal>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-blood">למה PushTakim?</p>
              <h2 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                כי תנועה לא אמורה להישאר לבד.
              </h2>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-9 text-zinc-300 sm:text-xl">
                אנחנו קיימים כדי לחבר אנשים דרך הגוף, דרך הרחוב, דרך האולם, דרך הרגע שבו מישהו אומר לך:
                נסה שוב, אני איתך.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative min-h-[28rem] overflow-hidden rounded-2xl shadow-[0_24px_90px_rgba(0,0,0,0.45)] sm:min-h-[34rem]">
              <Image
                src="/pushtakim-hero-photo.png"
                alt="רגע קהילתי של PushTakim"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/16 to-transparent" />
              <p className="absolute bottom-6 right-6 max-w-sm text-2xl font-black text-white sm:text-3xl">
                אנשים לפני טריקים.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-y border-white/10 bg-[#070707] px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(193,18,31,0.24),transparent_34rem),linear-gradient(180deg,#050505_0%,#111_48%,#050505_100%)]" />
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-blood" dir="ltr">PUSH TOUR 2026</p>
                <h2 className="mt-6 text-5xl font-black leading-none tracking-tight text-white sm:text-7xl" dir="ltr">
                  4 Gyms.
                  <br />
                  5 Cities.
                  <br />
                  One Community.
                </h2>
              </div>
              <div className="max-w-2xl space-y-5 text-lg font-medium leading-8 text-zinc-300">
                <p>אנחנו לא רק עוברים בין ערים.</p>
                <p className="text-2xl font-black text-white">אנחנו מחברים קהילות.</p>
                <p>
                  בכל תחנה מצטרפים אנשים חדשים,
                  <br />
                  לומדים משהו חדש,
                  <br />
                  וממשיכים ביחד לתחנה הבאה.
                </p>
                <p className="rounded-2xl border border-blood/40 bg-blood/10 p-4 text-base font-black leading-7 text-white">
                  עד שחיבור התשלום באתר יעלה — אפשר לשמור כרטיס ישירות בוואטסאפ.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {tourStops.map((event, index) => (
              <Reveal key={event.id} delay={index * 0.06} className="h-full">
                <article className="group relative flex h-full min-h-80 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/72 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.38)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-blood/70 hover:shadow-[0_24px_90px_rgba(193,18,31,0.16)]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-blood" />
                  <div className="absolute -left-12 top-10 size-28 rounded-full bg-blood/14 blur-3xl transition group-hover:bg-blood/24" aria-hidden="true" />
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-blood" dir="ltr">
                    {event.stop}
                  </p>
                  <div className="mt-8">
                    <h3 className="text-4xl font-black leading-tight text-white">{event.city}</h3>
                    <p className="mt-5 text-3xl font-black text-white" dir="ltr">{event.date}</p>
                    {event.time && <p className="mt-2 text-lg font-black text-blood" dir="ltr">{event.time}</p>}
                  </div>
                  <p className="mt-8 text-2xl font-black text-white/88">{event.venue}</p>
                  <p className="mt-3 text-sm font-bold leading-6 text-zinc-400">{event.address}</p>
                  <Link
                    href="#contact"
                    className="mt-auto inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blood px-5 py-3 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black sm:w-fit"
                  >
                    רוצה כרטיס? דברו איתנו
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
          <Reveal>
            <div className="relative min-h-[28rem] overflow-hidden rounded-2xl shadow-[0_24px_90px_rgba(0,0,0,0.45)] sm:min-h-[32rem]">
              <Image
                src="/pushtakim-hero-photo.png"
                alt="אנשים חוזרים מסשן תנועה"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/35" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-blood">מה לוקחים הביתה?</p>
              <h2 className="mt-6 text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                עם מה תחזרו הביתה?
              </h2>
              <div className="mt-12 grid gap-5 sm:grid-cols-2">
                {takeaways.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/70 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]">
                    <p className="text-2xl font-black text-white">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#080808] px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-blood">כל מה שאנחנו עושים</p>
              <h2 className="mt-6 text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                הטור הוא רק ההתחלה.
              </h2>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-zinc-300">
                סדנאות וחוגים. מופעים ופעלולים. פרויקטים. ביגוד ואקססוריז.
              </p>
            </div>
          </Reveal>
          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {everythingElse.map((item, index) => (
              <Reveal key={item.href} delay={index * 0.06} className="h-full">
                <Link
                  href={item.href}
                  className="group flex min-h-72 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-1 hover:border-blood/70 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]"
                >
                  <div className="mb-auto h-32 rounded-2xl bg-[linear-gradient(135deg,rgba(193,18,31,0.22),transparent_42%),radial-gradient(circle_at_60%_35%,rgba(255,255,255,0.14),transparent_9rem)] transition duration-300 group-hover:scale-[1.02]" />
                  <p className="mt-8 text-2xl font-black text-white">{item.title}</p>
                  <p className="mt-4 text-sm font-bold text-blood">להמשיך</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="guides" className="px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <Reveal>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-blood">מדריכים חינמיים</p>
              <h2 className="mt-6 text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                ללמוד לזוז — גם לפני האירוע
              </h2>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-zinc-300">
                חיברנו לכם מדריכים קצרים מהיוטיוב שלנו כדי שתוכלו להתחיל לזוז, להבין את הווייב, ולהגיע לאירוע עם חשק לפתוח עוד דלת בעולם התנועה.
              </p>
              <Link
                href="https://youtube.com/@pushtakim692"
                className="mt-12 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-blood px-8 py-4 text-center text-base font-black text-white shadow-[0_20px_80px_rgba(193,18,31,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black sm:w-auto"
              >
                צפו במדריכים
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[9/16] min-h-[34rem] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_90px_rgba(0,0,0,0.45)] sm:aspect-video lg:aspect-[9/16]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(193,18,31,0.22),transparent_42%),radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.14),transparent_10rem)]" />
              <div className="absolute inset-0 grid place-items-center p-8 text-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.28em] text-blood" dir="ltr">YouTube Shorts</p>
                  <p className="mt-5 text-3xl font-black text-white">מדריך קצר יופיע כאן</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="contact" className="border-y border-white/10 bg-[#080808] px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
          <Reveal>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-blood">צור קשר</p>
              <h2 className="mt-6 text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                רוצים כרטיס או שאלה מהירה?
              </h2>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-zinc-300">
                עד שחיבור התשלום באתר יעלה — אפשר לשמור כרטיס ישירות בוואטסאפ.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-5 sm:grid-cols-3">
              <a
                href="https://wa.me/972547632268"
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-1 hover:border-blood/70 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]"
              >
                <p className="text-sm font-black text-blood">WhatsApp</p>
                <p className="mt-4 text-2xl font-black text-white" dir="ltr">0547632268</p>
              </a>
              <a
                href="https://www.instagram.com/_pushtakim_"
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-1 hover:border-blood/70 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]"
              >
                <p className="text-sm font-black text-blood">Instagram</p>
                <p className="mt-4 text-2xl font-black text-white" dir="ltr">@_pushtakim_</p>
              </a>
              <a
                href="https://youtube.com/@pushtakim692"
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-1 hover:border-blood/70 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]"
              >
                <p className="text-sm font-black text-blood">YouTube</p>
                <p className="mt-4 text-2xl font-black text-white" dir="ltr">@pushtakim692</p>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative isolate min-h-[82vh] overflow-hidden px-5 py-28 sm:px-8 sm:py-36 lg:py-44">
        <Image
          src="/pushtakim-hero-photo.png"
          alt="קהילת PushTakim ביחד"
          fill
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-black/72" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_42%,rgba(193,18,31,0.22),transparent_34rem)]" />
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center">
          <Reveal>
            <div className="max-w-5xl">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-blood">מניפסט</p>
              <h2 className="mt-7 text-5xl font-black leading-tight text-white sm:text-7xl lg:text-8xl">
                אם אתם אוהבים לזוז,
                <br />
                יש לכם כאן בית.
              </h2>
              <p className="mt-8 max-w-2xl text-lg font-medium leading-9 text-zinc-300 sm:text-xl">
                לא משנה מאיפה באתם. לא משנה איך קוראים למה שאתם עושים. אנחנו נפגשים בתנועה.
              </p>
              <Link
                href="/events"
                className="mt-12 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-blood px-8 py-4 text-center text-base font-black text-white shadow-[0_20px_80px_rgba(193,18,31,0.28)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black sm:w-auto"
              >
                בואו נזוז ביחד
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

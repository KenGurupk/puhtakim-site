import type { Metadata } from "next";
import Image from "next/image";

import { EventCard } from "@/components/cards/event-card";
import { AugustTourNotice } from "@/components/events/august-tour-notice";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";
import { events } from "@/data/content";
import { eventPosterMedia } from "@/lib/section-media-manifest";

const copy = siteCopy.pages.events;

export const metadata: Metadata = copy.metadata;

const arrivalReasons = [
  {
    icon: "🤝",
    title: "מחברים את הקהילות",
    text: "מפגש אחד שמביא יחד פארקור, פריראן, טריקינג, קליסטניקס, ברייקדאנס ועוד דרכים לזוז."
  },
  {
    icon: "🧠",
    title: "לומדים מאנשים שונים",
    text: "מאמנים ואתלטים מתחומי תנועה שונים משתפים כלים, רעיונות וסגנונות שאפשר לקחת לאימון הבא."
  },
  {
    icon: "🏠",
    title: "תומכים באולמות מקומיים",
    text: "כל תחנה התקיימה באולם אחר שנבנה מתוך הקהילה, כדי לתת עוד בית לתנועה בישראל."
  },
  {
    icon: "🏆",
    title: "אתגרים ופרסים",
    text: "משימות לרמות שונות, פרסים ועמדות של מותגים שנוצרו על ידי אתלטים מהקהילה."
  },
  {
    icon: "🩺",
    title: "מחקר פציעות",
    text: "ההשתתפות עזרה לקדם מחקר פציעות שאנחנו מובילים יחד עם אנשי מקצוע בתחום האורתופדיה."
  },
  {
    icon: "🔥",
    title: "בונים סצנה חזקה יותר",
    text: "המטרה נשארת אותה מטרה: לחבר אנשים, מקומות ויוזמות ולהגדיל יחד את תרבות התנועה בישראל."
  }
];

const eventMoments = [
  {
    src: "/drive-assets/curated/homepage-community.jpg",
    alt: "רגע תנועה קבוצתי של PushTakim",
    className: "md:col-span-2"
  },
  {
    src: "/drive-assets/photos/community-01.jpg",
    alt: "אימון קהילתי פתוח על הדשא",
    className: ""
  }
];

const eventPresentation: Record<
  string,
  {
    statusBadge?: string;
    isCompleted?: boolean;
    displayTitle?: string;
    displayDescription?: string;
  }
> = {
  "push-tour-mabuza": {
    statusBadge: "הסתיים בהצלחה ✓",
    isCompleted: true
  },
  "push-tour-raiz": {
    statusBadge: "הסתיים בהצלחה ✓",
    isCompleted: true
  },
  "push-tour-pk-spot": {
    statusBadge: "הסתיים בהצלחה ✓",
    isCompleted: true,
    displayTitle: "Push Tour בבאר שבע",
    displayDescription: "אירוע פארקור ב־PK Spot עם תחרות סקיל, קהילה, אתגרים והרבה תנועה."
  },
  "push-tour-calima": {
    statusBadge: "הסתיים בהצלחה ✓",
    isCompleted: true,
    displayTitle: "Push Tour ב־Calima ראשון לציון",
    displayDescription: "אירוע הסיום של הטור: סדנה, אתגרים, פרסים ואימון פתוח יחד עם הקהילה."
  }
};

const eventDisplayOrder = ["push-tour-mabuza", "push-tour-raiz", "push-tour-pk-spot", "push-tour-calima"];

const recapItems = [
  {
    title: "Mabuza • 3.8",
    text: "התחנה הראשונה של הסבב.",
    href: "https://youtube.com/shorts/mAO6p4Tf5kY?si=5-viZIGkmRqfeDmP",
    platform: "YouTube"
  },
  {
    title: "Raiz • 14.8",
    text: "סיכום המפגש במודיעין.",
    href: "https://www.instagram.com/reel/DcEdcYCITJZ/?igsi=MWxpcHZvZmFyNW8zOQ==",
    platform: "Instagram"
  },
  {
    title: "PK Spot • 16.8",
    text: "סיכום התחרות והמפגש בבאר שבע.",
    href: "https://www.instagram.com/reel/DcdxiKeI625/?igsi=Z2Nqa3d3b21vaXp1",
    platform: "Instagram"
  },
  {
    title: "Calima • 28.8",
    text: "סרטון הסיכום של אירוע הסיום יעלה בקרוב.",
    href: null,
    platform: "בקרוב"
  }
] as const;

export default function EventsPage() {
  const orderedEvents = eventDisplayOrder.flatMap((eventId) => events.filter((event) => event.id === eventId));
  const displayedEvents = [...orderedEvents, ...events.filter((event) => !eventDisplayOrder.includes(event.id))];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-black">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/drive-assets/curated/homepage-community.jpg"
            alt="קהילת PushTakim במפגש פתוח"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.68)_44%,rgba(0,0,0,0.24)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-center px-5 py-28 sm:px-8 lg:min-h-[78vh]">
          <Reveal>
            <div className="max-w-4xl">
              <p className="text-sm font-black tracking-[0.18em] text-blood">PUSH TOUR 2026 • המסע הושלם ❤️‍🔥</p>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                ארבעה אולמות. קהילות מכל הארץ. קהילה אחת.
              </h1>
              <p className="mt-7 max-w-3xl text-lg font-bold leading-8 text-zinc-200 sm:text-xl">
                מבוזה, מודיעין, באר שבע וראשון לציון. תודה לכל מי שבא לזוז, ללמוד, להתחרות, לעזור ולהרים איתנו את הסבב הזה.
              </p>
              <p className="mt-6 text-2xl font-black text-amber-200">זה לא הסוף. רק התחממנו.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <AugustTourNotice />

      <Section
        id="tour-recaps"
        eyebrow="סיכום הטור"
        title="הרגעים מהדרך"
        description="הסבב הסתיים, אבל הרגעים נשארים. הנה סרטוני הסיכום שכבר עלו — והסיכום מראשון לציון יצטרף אליהם בקרוב."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recapItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05} className="h-full">
              <article className="motion-card flex h-full min-h-56 flex-col rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/60">
                <p className="text-xs font-black tracking-[0.14em] text-blood">{item.platform}</p>
                <h2 className="mt-4 text-2xl font-black text-white">{item.title}</h2>
                <p className="mt-3 flex-1 text-sm font-bold leading-7 text-zinc-300">{item.text}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="motion-button mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blood px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
                  >
                    לצפייה בסרטון ↗
                  </a>
                ) : (
                  <div className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-black text-zinc-400">
                    יעלה בקרוב
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="event-stops" eyebrow="ארבע תחנות" title="Push Tour 2026 הסתיים בהצלחה" description="כל ארבע התחנות מאחורינו. אין כרגע כרטיסים פעילים לרכישה באתר.">
        <div className="grid gap-4 lg:grid-cols-2">
          {displayedEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              delay={index * 0.05}
              ctaMode="scroll-to-tickets"
              {...eventPresentation[event.id]}
            />
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {eventMoments.map((image, index) => (
            <Reveal key={image.src} delay={index * 0.05} className={image.className}>
              <div className="motion-card group relative min-h-[22rem] overflow-hidden rounded-2xl border border-white/10 bg-[#070707] shadow-[0_20px_80px_rgba(0,0,0,0.34)] transition duration-300 hover:-translate-y-1 hover:border-blood/60">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent" />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="למה הטור הזה היה מיוחד" title="כי זה היה הרבה יותר מעוד אימון." description="Push Tour חיבר בין תחומים, אולמות ואנשים — וכל תחנה הוסיפה עוד חתיכה לסצנת התנועה שאנחנו בונים יחד.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {arrivalReasons.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04} className="h-full">
              <article className="motion-card flex h-full min-h-72 flex-col rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]">
                <span className="grid size-12 place-items-center rounded-2xl border border-blood/35 bg-blood/12 text-2xl">{item.icon}</span>
                <h2 className="mt-6 text-2xl font-black leading-tight text-white">{item.title}</h2>
                <p className="mt-4 text-sm font-medium leading-7 text-zinc-300">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-blood/35 bg-[linear-gradient(135deg,rgba(193,18,31,0.18),rgba(255,255,255,0.045)_42%,rgba(0,0,0,0.68))] p-7 shadow-[0_30px_110px_rgba(193,18,31,0.12)] sm:p-10">
            <div className="absolute -left-10 -top-10 size-40 rounded-full bg-blood/18 blur-3xl" aria-hidden="true" />
            <div className="relative max-w-5xl">
              <p className="text-sm font-black tracking-[0.18em] text-blood">מה עכשיו?</p>
              <h2 className="mt-5 text-4xl font-black leading-tight text-white sm:text-6xl">המסע לא מסתיים פה.</h2>
              <p className="mt-6 max-w-3xl text-xl font-bold leading-9 text-zinc-200">
                כבר עובדים על האירוע הבא — האירוע השנתי הכי גדול שלנו. האתר ימשיך להתפתח למקום שבו אפשר לעקוב אחרי מה שקורה בתרבות התנועה בישראל.
              </p>
              <p className="mt-5 text-2xl font-black text-amber-200">אנחנו רק מתחממים 🔥</p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {eventPosterMedia.map((poster) => (
            <div
              key={poster.src}
              className="motion-card rounded-2xl border border-white/10 bg-white/[0.045] p-3 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]"
            >
              <div className="relative overflow-hidden rounded-xl bg-[#070707]" style={{ aspectRatio: poster.aspectRatio }}>
                <Image
                  src={poster.src}
                  alt={poster.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  quality={75}
                  className="object-contain"
                />
              </div>
              <p className="mt-4 text-center text-base font-black text-white">{poster.alt}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

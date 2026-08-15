import type { Metadata } from "next";
import Image from "next/image";

import { EventCard } from "@/components/cards/event-card";
import { AugustTourNotice } from "@/components/events/august-tour-notice";
import { DiscountedTicketCta } from "@/components/events/discounted-ticket-cta";
import { PricingFaq } from "@/components/home/pricing-faq";
import { PushTourPricing } from "@/components/home/push-tour-pricing";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";
import { events } from "@/data/content";
import { eventPosterMedia } from "@/lib/section-media-manifest";

const copy = siteCopy.pages.events;
const pricingCopy = siteCopy.home.pricing;

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
    text: "כל תחנה מתקיימת באולם אחר שנבנה מתוך הקהילה, בשביל לתת עוד בית לתנועה בישראל."
  },
  {
    icon: "🏆",
    title: "אתגרים ופרסים",
    text: "משימות שמתאימות לרמות שונות, פרסים ועמדות של מותגים שנוצרו על ידי אתלטים מהקהילה."
  },
  {
    icon: "🩺",
    title: "מחקר פציעות",
    text: "ההשתתפות עוזרת לקדם מחקר פציעות שאנחנו מובילים יחד עם אנשי מקצוע בתחום האורתופדיה."
  },
  {
    icon: "🔥",
    title: "בונים סצנה חזקה יותר",
    text: "המטרה היא לחבר אנשים, מקומות ויוזמות כדי להגדיל יחד את תרבות התנועה בישראל."
  }
];

const meetingFlowItems = [
  {
    title: "סדנה מקצועית",
    text: "כל אחד יכול לצאת עם כלים וטריקים חדשים."
  },
  {
    title: "אימון פתוח",
    text: "זמן להתאמן, לשאול, לנסות ולהכיר את האולם."
  },
  {
    title: "אתגרים ופרסים",
    text: "משימות שמתאימות לרמות שונות, לא רק למקצוענים."
  },
  {
    title: "אתלטים מכל התחומים",
    text: "הזדמנות ללמוד מסגנונות תנועה אחרים."
  },
  {
    title: "קהילה חדשה",
    text: "אנשים, מאמנים, מותגים ומקומות שלא פוגשים באימון רגיל."
  }
];

const experienceItems = [
  "סדנה מקצועית",
  "אימון פתוח",
  "אתגרים ופרסים",
  "אתלטים מכל הארץ",
  "ג׳אם חופשי",
  "חוויה קהילתית",
  "הפתעות בדרך"
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
    isHighlighted?: boolean;
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
    statusBadge: "התחנה הבאה",
    isHighlighted: true,
    displayTitle: "Push Tour מגיע לבאר שבע",
    displayDescription: "אירוע פארקור ב־PK Spot עם וייב תחרותי, קהילה, אתגרים והרבה תנועה."
  },
  "push-tour-calima": {
    statusBadge: "אירוע הסיום",
    displayTitle: "אירוע הסיום | Calima ראשון לציון",
    displayDescription: "סדנה, אתגרים ואימון פתוח באולם הקליסטניקס הראשון מסוגו שנפתח בארץ."
  }
};

const eventDisplayOrder = ["push-tour-pk-spot", "push-tour-calima", "push-tour-raiz", "push-tour-mabuza"];

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
          <div className="absolute inset-0 bg-black/68" />
          <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.66)_44%,rgba(0,0,0,0.2)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        </div>

        <div className="mx-auto flex min-h-[72vh] max-w-7xl flex-col justify-center px-5 py-28 sm:px-8 lg:min-h-[78vh]">
          <Reveal>
            <div className="max-w-4xl">
              <p className="text-sm font-black tracking-[0.18em] text-blood">המסע כבר בשלב האחרון 🔥</p>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                2 אירועים מאחורינו. נשארו שניים אחרונים.
              </h1>
              <p className="mt-7 max-w-3xl text-lg font-bold leading-8 text-zinc-200 sm:text-xl">
                מבוזה ומודיעין כבר מאחורינו. עכשיו ממשיכים לבאר שבע ולראשון לציון עם עוד סדנאות, אתגרים, פרסים וקהילות מכל הארץ.
              </p>
              <div className="mt-9">
                <DiscountedTicketCta label="למפגשים ולכרטיסים ↓" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <AugustTourNotice />

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

      <Section eyebrow="למה האירוע הזה מיוחד" title="כי זה הרבה יותר מעוד אימון." description="Push Tour הוא המקום שבו תחומים נפגשים, אנשים מתחברים, וכל אחד יוצא עם עוד סיבה לזוז.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {arrivalReasons.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04} className="h-full">
              <article className="motion-card flex h-full min-h-72 flex-col rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]">
                <span className="grid size-12 place-items-center rounded-2xl border border-blood/35 bg-blood/12 text-2xl">
                  {item.icon}
                </span>
                <h2 className="mt-6 text-2xl font-black leading-tight text-white">{item.title}</h2>
                <p className="mt-4 text-sm font-medium leading-7 text-zinc-300">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="מה עושים שם?" title="מה באמת קורה בשעתיים האלה?" description="בלי סיבוכים ובלי קירות טקסט. מגיעים, זזים, לומדים, מכירים אנשים ויוצאים עם אנרגיה חדשה.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {meetingFlowItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <article className="motion-card flex h-full min-h-36 flex-col rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-blood/60">
                <p className="text-lg font-black leading-tight text-white">{item.title}</p>
                <p className="mt-3 text-sm font-medium leading-6 text-zinc-300">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.08}>
          <div className="mt-5 rounded-2xl border border-blood/35 bg-blood/10 p-5 shadow-[0_20px_80px_rgba(193,18,31,0.1)]">
            <p className="text-2xl font-black text-white">לא צריך להיות מקצוענים.</p>
            <p className="mt-3 max-w-4xl text-base font-bold leading-7 text-zinc-200">
              בין אם רק התחלתם ובין אם אתם מתאמנים שנים — המפגשים בנויים כך שכל אחד יוכל ללמוד, להתנסות ולצאת עם משהו חדש.
            </p>
          </div>
        </Reveal>
      </Section>

      <Section id="event-stops" eyebrow="תחנות הטור" title="שתי התחנות האחרונות" description="מבוזה ומודיעין הסתיימו בהצלחה. עכשיו נשארו באר שבע וראשון לציון, וכל כרטיס באתר שייך רק לאחת מהתחנות שעדיין פתוחות.">
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

      <PushTourPricing
        title={"2 אירועים מאחורינו.\nנשארו שניים אחרונים 🔥"}
        subtitle="באר שבע או ראשון לציון? בחרו את התחנה שלכם ובואו לסיים איתנו את הסבב."
        valueLine="שתי אפשרויות בלבד: מחיר מיוחד לבאר שבע, וכרטיס לאירוע הסיום בראשון לציון."
        question={null}
        showFaq={false}
      />

      <Section>
        <Reveal>
          <blockquote className="relative overflow-hidden rounded-3xl border border-blood/35 bg-[linear-gradient(135deg,rgba(193,18,31,0.18),rgba(255,255,255,0.045)_42%,rgba(0,0,0,0.68))] p-7 shadow-[0_30px_110px_rgba(193,18,31,0.12)] sm:p-10">
            <div className="absolute -left-10 -top-10 size-40 rounded-full bg-blood/18 blur-3xl" aria-hidden="true" />
            <div className="relative max-w-5xl space-y-5 text-3xl font-black leading-tight text-white sm:text-5xl">
              <p>פארקור או פריראן?</p>
              <p>טריקינג או אקרובטיקה?</p>
              <p>קליסטניקס או סטריט וורקאאוט?</p>
              <p>ברייקדאנס או מובמנט?</p>
              <p className="pt-4 text-blood">...</p>
              <p>בסוף, לכולנו יש מכנה משותף אחד — אהבה לחופש התנועה.</p>
              <p className="text-xl font-bold leading-8 text-zinc-200 sm:text-2xl">
                המפגשים נוצרו כדי לחבר בין הקהילות, ללמוד אחד מהשני ולהגדיל יחד את סצנת התנועה בישראל.
              </p>
            </div>
          </blockquote>
        </Reveal>
      </Section>

      <Section eyebrow="מה מחכה לכם בכל תחנה?" title="באים לזוז. ללמוד. ולהכיר משפחה חדשה." description="כל תחנה היא הזדמנות להיכנס לאולם חדש, לפגוש אנשים שלא הכרתם ולגלות דרך אחרת לזוז.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {experienceItems.map((item, index) => (
            <Reveal key={item} delay={index * 0.04}>
              <div className="motion-card flex min-h-20 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-base font-black text-white shadow-[0_18px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-blood/60">
                <span className="text-blood">✓</span>
                <span>{item}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal>
          <PricingFaq title={pricingCopy.faq.title} items={pricingCopy.faq.items} />
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
      <Section {...copy.ticketSystem}>
        <div className="grid gap-4 md:grid-cols-3">
          {copy.ticketSystem.items.map((item) => (
            <div key={item} className="motion-card rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
              <p className="text-2xl font-black leading-tight text-white">{item}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

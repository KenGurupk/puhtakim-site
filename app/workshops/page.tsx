import type { Metadata } from "next";
import Link from "next/link";

import { FeatureCard } from "@/components/cards/feature-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";
import { workshops } from "@/data/content";
import { pageMedia } from "@/lib/section-media-manifest";

const copy = siteCopy.pages.workshops;

export const metadata: Metadata = copy.metadata;

export default function WorkshopsPage() {
  return (
    <>
      <PageHero {...copy.hero} />
      <Section eyebrow="חוגים קבועים" title="אנחנו לא רק נפגשים באירועים 😉" description="אנחנו גם בונים אתכם מאפס. אימוני תנועה ופארקור בקבוצות קטנות, מהצעדים הראשונים ועד לתנועה חופשית ובטוחה.">
        <article className="motion-card relative isolate overflow-hidden rounded-3xl border border-blood/45 bg-[#080808] p-5 shadow-[0_24px_90px_rgba(193,18,31,0.16)] sm:p-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_0%,rgba(193,18,31,0.28),transparent_24rem)]" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex rounded-full border border-blood/60 bg-blood/15 px-4 py-2 text-sm font-black text-white">ההרשמה פתוחה</span>
              <h3 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">חוג תנועה ופארקור לילדים</h3>
              <div className="mt-5 grid gap-2 text-base font-bold leading-7 text-zinc-300">
                <p>ימי רביעי</p>
                <p dir="ltr" className="text-right">17:30–18:45</p>
                <p>גינת דובנוב, תל אביב</p>
                <p className="text-white">קבוצה קטנה | מספר המקומות מוגבל</p>
              </div>
            </div>
            <Link href="/classes/dubnov-kids" className="motion-button inline-flex min-h-14 w-full shrink-0 items-center justify-center rounded-2xl bg-blood px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] sm:w-auto">להרשמה ופרטים</Link>
          </div>
        </article>
      </Section>
      <Section><div className="grid gap-4 md:grid-cols-3">{workshops.map((workshop, index) => <FeatureCard key={workshop.title} {...workshop} delay={index * 0.08} />)}</div></Section>
      <Section {...copy.offerings}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{copy.offerings.items.map((item) => <div key={item} className="motion-card rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-4 text-base font-black text-white shadow-[0_18px_70px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:text-blood">{item}</div>)}</div></Section>
      <Section><div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center"><MediaFrame src={pageMedia.workshops.src} alt={pageMedia.workshops.alt} fit={pageMedia.workshops.fit} label={copy.mediaLabel} className="min-h-[24rem]" /><div><h2 className="text-4xl font-black text-white sm:text-5xl">{copy.inviteTitle}</h2><p className="mt-5 text-base leading-8 text-zinc-300">{copy.inviteText}</p><Link href="/contact" className="motion-button mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl bg-blood px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]">{siteCopy.shared.contactUs}</Link></div></div></Section>
    </>
  );
}

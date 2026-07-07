import type { Metadata } from "next";
import Link from "next/link";

import { FeatureCard } from "@/components/cards/feature-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";
import { workshops } from "@/data/content";

const copy = siteCopy.pages.workshops;

export const metadata: Metadata = copy.metadata;

export default function WorkshopsPage() {
  return (
    <>
      <PageHero {...copy.hero} />
      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {workshops.map((workshop, index) => (
            <FeatureCard key={workshop.title} {...workshop} delay={index * 0.08} />
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <MediaFrame src="/images/workshops-source.jpg" label={copy.mediaLabel} className="min-h-[24rem]" />
          <div>
            <h2 className="text-4xl font-black text-white sm:text-5xl">{copy.inviteTitle}</h2>
            <p className="mt-5 text-base leading-8 text-zinc-300">
              {copy.inviteText}
            </p>
            <Link href="/contact" className="motion-button mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl bg-blood px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]">
              {siteCopy.shared.contactUs}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

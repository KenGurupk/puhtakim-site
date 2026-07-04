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
          <MediaFrame src="/images/workshops.jpg" label={copy.mediaLabel} className="min-h-[24rem]" />
          <div>
            <h2 className="text-4xl font-black text-white sm:text-5xl">{copy.inviteTitle}</h2>
            <p className="mt-5 text-base leading-8 text-zinc-300">
              {copy.inviteText}
            </p>
            <Link href="/contact" className="mt-8 inline-flex bg-blood px-7 py-4 text-base font-black text-white transition hover:bg-white hover:text-black">
              {siteCopy.shared.contactUs}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { FeatureCard } from "@/components/cards/feature-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";
import { shows } from "@/data/content";

const copy = siteCopy.pages.shows;

export const metadata: Metadata = copy.metadata;

export default function ShowsPage() {
  return (
    <>
      <PageHero {...copy.hero} />
      <Section>
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <MediaFrame src="/images/shows-source.jpg" label={copy.mediaLabel} className="min-h-[30rem]" />
          <div className="grid gap-4">
            {shows.map((show, index) => (
              <FeatureCard key={show.title} {...show} delay={index * 0.08} />
            ))}
          </div>
        </div>
      </Section>
      <Section {...copy.booking}>
        <Link href="/contact" className="motion-button inline-flex min-h-14 items-center justify-center rounded-2xl bg-blood px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]">
          {copy.booking.cta}
        </Link>
      </Section>
    </>
  );
}

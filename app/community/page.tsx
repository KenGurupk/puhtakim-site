import type { Metadata } from "next";
import Link from "next/link";

import { FeatureCard } from "@/components/cards/feature-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";

const copy = siteCopy.pages.community;

export const metadata: Metadata = copy.metadata;

export default function CommunityPage() {
  return (
    <>
      <PageHero {...copy.hero} />
      <Section>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <MediaFrame src="/drive-assets/curated/community-group.jpg" label={copy.mediaLabel} className="min-h-[26rem]" />
          <div className="grid gap-4">
            {copy.tracks.map((track, index) => (
              <FeatureCard key={track.title} {...track} delay={index * 0.06} />
            ))}
          </div>
        </div>
      </Section>
      <Section {...copy.join}>
        <Link href="/events" className="motion-button inline-flex min-h-14 items-center justify-center rounded-2xl bg-blood px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]">
          {siteCopy.shared.upcomingEvents}
        </Link>
      </Section>
    </>
  );
}

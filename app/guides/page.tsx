import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { YouTubeGuideCard } from "@/components/ui/youtube-guide-card";
import { siteCopy } from "@/content/site-copy";

const copy = siteCopy.pages.guides;

export const metadata: Metadata = copy.metadata;

export default function GuidesPage() {
  return (
    <>
      <PageHero {...copy.hero} />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <div className="space-y-5 text-lg leading-8 text-zinc-300">
              <p>{copy.intro}</p>
              <p>{copy.text}</p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <YouTubeGuideCard {...copy.videos[0]} />
          </Reveal>
        </div>
      </Section>
    </>
  );
}

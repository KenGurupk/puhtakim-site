import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { MediaFrame } from "@/components/ui/media-frame";
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
        <div className="grid min-w-0 gap-8 overflow-hidden lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal className="min-w-0">
            <div className="min-w-0 space-y-5 break-words text-lg leading-8 text-zinc-300">
              <p>{copy.intro}</p>
              <p>{copy.text}</p>
              <MediaFrame
                src="/drive-assets/guides/guides-action.jpg"
                label="רגע של תנועה שאפשר להתחיל ללמוד ממנו"
                className="mt-8 min-h-[18rem] lg:aspect-[16/10]"
              />
            </div>
          </Reveal>

          <Reveal delay={0.08} className="min-w-0">
            <YouTubeGuideCard {...copy.videos[0]} />
          </Reveal>
        </div>
      </Section>
    </>
  );
}

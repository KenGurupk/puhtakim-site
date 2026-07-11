import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FeatureCard } from "@/components/cards/feature-card";
import { Reveal } from "@/components/motion/reveal";
import { MediaFrame } from "@/components/ui/media-frame";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";
import { pageMedia } from "@/lib/section-media-manifest";

const copy = siteCopy.pages.community;

export const metadata: Metadata = copy.metadata;

export default function CommunityPage() {
  return (
    <>
      <section className="mx-auto grid min-w-0 max-w-7xl gap-8 px-5 pb-14 pt-16 sm:px-8 sm:pb-16 sm:pt-24 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <Reveal>
          <div>
            <p className="break-words text-sm font-black tracking-[0.12em] text-blood">{copy.hero.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl whitespace-pre-line break-words text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              {copy.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl whitespace-pre-line break-words text-base font-medium leading-8 text-zinc-300 sm:text-lg">
              {copy.hero.description}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#090909] shadow-[0_18px_70px_rgba(0,0,0,0.32)]">
            <Image
              src="/drive-assets/community/IMG_2695.JPG"
              alt={copy.hero.title}
              width={1800}
              height={1200}
              sizes="(min-width: 1024px) 48vw, 100vw"
              quality={75}
              className="h-auto w-full object-contain"
            />
          </div>
        </Reveal>
      </section>
      <Section>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <MediaFrame src={pageMedia.community.src} alt={pageMedia.community.alt} fit={pageMedia.community.fit} label={copy.mediaLabel} className="min-h-[26rem]" />
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

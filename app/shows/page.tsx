import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FeatureCard } from "@/components/cards/feature-card";
import { Reveal } from "@/components/motion/reveal";
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
        <div className="grid min-w-0 gap-5 lg:grid-cols-[1fr_1fr] lg:items-start">
          <MediaFrame
            src="/drive-assets/shows/shows-action.jpg"
            label={copy.mediaLabel}
            fit="contain"
            position="center top"
            className="min-h-[24rem] sm:min-h-[28rem] lg:min-h-[30rem]"
          />
          <div className="grid min-w-0 gap-4">
            {shows.map((show, index) => (
              <FeatureCard key={show.title} {...show} delay={index * 0.08} />
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { src: "/drive-assets/shows/shows-crowd.jpg", className: "lg:col-span-2" },
            { src: "/drive-assets/shows/shows-rooftop-air.jpg", className: "" },
            { src: "/drive-assets/shows/shows-urban-motion.jpg", className: "" },
            { src: "/drive-assets/curated/events-night.jpg", className: "lg:col-span-2" }
          ].map((item, index) => (
            <Reveal key={item.src} delay={index * 0.06} className={item.className}>
              <div className="motion-card image-reveal relative min-h-[18rem] overflow-hidden rounded-2xl border border-white/10 bg-[#090909] shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-500 hover:-translate-y-1 hover:border-blood/50">
                <Image
                  src={item.src}
                  alt={copy.hero.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  quality={70}
                  className="object-cover transition duration-700 hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-black/25" />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section {...copy.featuredShow}>
        <Link
          href={copy.featuredShow.href}
          target="_blank"
          rel="noopener noreferrer"
          className="motion-button inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/25 bg-white/8 px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-black active:scale-[0.98]"
        >
          {copy.featuredShow.cta}
        </Link>
      </Section>
      <Section {...copy.booking}>
        <Link href="/contact" className="motion-button inline-flex min-h-14 items-center justify-center rounded-2xl bg-blood px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]">
          {copy.booking.cta}
        </Link>
      </Section>
    </>
  );
}

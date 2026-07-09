import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FeatureCard } from "@/components/cards/feature-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";
import { productionServices } from "@/data/content";

const copy = siteCopy.pages.productions;

export const metadata: Metadata = copy.metadata;

export default function ProductionsPage() {
  return (
    <>
      <PageHero {...copy.hero} />
      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {productionServices.map((service, index) => (
            <FeatureCard key={service.title} {...service} delay={index * 0.08} />
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-4xl font-black text-white sm:text-5xl">{copy.buildTitle}</h2>
            <div className="mt-8 grid gap-3 text-sm font-bold text-zinc-300">
              {copy.items.map((item) => (
                <p key={item} className="border-r-2 border-blood pr-4">{item}</p>
              ))}
            </div>
            <Link href="/contact" className="motion-button mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl bg-blood px-7 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]">
              {copy.cta}
            </Link>
          </div>
          <MediaFrame src="/drive-assets/curated/production-commercial.jpg" label={copy.mediaLabel} className="min-h-[28rem]" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[0.85fr_1.15fr]">
          {[
            "/drive-assets/productions/production-urban.jpg",
            "/drive-assets/productions/production-air.jpg",
            "/drive-assets/productions/production-dome.jpg",
            "/drive-assets/productions/production-color.jpg"
          ].map((src, index) => (
            <div key={src} className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#090909] shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-500 hover:-translate-y-1 hover:border-blood/50 ${index === 1 ? "min-h-[30rem] sm:row-span-2" : "min-h-[22rem]"}`}>
              <Image
                src={src}
                alt={copy.hero.title}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                quality={70}
                className="object-contain p-2 transition duration-700 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/12" />
            </div>
          ))}
        </div>
      </Section>
      <Section {...copy.featured}>
        <div className="grid gap-4 md:grid-cols-3">
          {copy.featured.items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="motion-card rounded-2xl border border-white/10 bg-white/[0.045] p-6 text-center shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]"
            >
              <p className="text-2xl font-black text-white">{item.title}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

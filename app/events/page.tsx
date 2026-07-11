import type { Metadata } from "next";
import Image from "next/image";

import { EventCard } from "@/components/cards/event-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";
import { events } from "@/data/content";
import { eventPosterMedia, pageMedia } from "@/lib/section-media-manifest";

const copy = siteCopy.pages.events;

export const metadata: Metadata = copy.metadata;

export default function EventsPage() {
  return (
    <>
      <PageHero {...copy.hero} />
      <Section {...copy.freedom}>
        <div className="grid gap-4 md:grid-cols-2">
          {copy.freedom.cards.map((item) => (
            <div key={item.title} className="motion-card rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]">
              <p className="text-sm font-black tracking-[0.16em] text-blood">{item.title}</p>
              <p className="mt-4 text-2xl font-black leading-tight text-white">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-3xl whitespace-pre-line text-lg font-medium leading-9 text-zinc-300">
          {copy.freedom.text}
        </p>
      </Section>
      <Section>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <MediaFrame src={pageMedia.events.src} alt={pageMedia.events.alt} fit={pageMedia.events.fit} label={copy.mediaLabel} className="min-h-[28rem]" />
          <div className="grid gap-4">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} delay={index * 0.05} />
            ))}
          </div>
        </div>
      </Section>
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {eventPosterMedia.map((poster) => (
            <div
              key={poster.src}
              className="motion-card rounded-2xl border border-white/10 bg-white/[0.045] p-3 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]"
            >
              <div className="relative overflow-hidden rounded-xl bg-[#070707]" style={{ aspectRatio: poster.aspectRatio }}>
                <Image
                  src={poster.src}
                  alt={poster.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  quality={75}
                  className="object-contain"
                />
              </div>
              <p className="mt-4 text-center text-base font-black text-white">{poster.alt}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section {...copy.ticketSystem}>
        <div className="grid gap-4 md:grid-cols-3">
          {copy.ticketSystem.items.map((item) => (
            <div key={item} className="motion-card rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
              <p className="text-2xl font-black leading-tight text-white">{item}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

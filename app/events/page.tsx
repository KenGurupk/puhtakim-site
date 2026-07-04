import type { Metadata } from "next";

import { EventCard } from "@/components/cards/event-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";
import { events } from "@/data/content";

const copy = siteCopy.pages.events;

export const metadata: Metadata = copy.metadata;

export default function EventsPage() {
  return (
    <>
      <PageHero {...copy.hero} />
      <Section>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <MediaFrame src="/images/events.jpg" label={copy.mediaLabel} className="min-h-[28rem]" />
          <div className="grid gap-4">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} delay={index * 0.05} />
            ))}
          </div>
        </div>
      </Section>
      <Section {...copy.ticketSystem}>
        <div className="grid gap-4 md:grid-cols-3">
          {copy.ticketSystem.items.map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
              <p className="text-2xl font-black text-white">{item}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

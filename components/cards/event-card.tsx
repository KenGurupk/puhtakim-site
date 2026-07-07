import Link from "next/link";

import { siteCopy } from "@/content/site-copy";
import { getTicketAction } from "@/lib/tickets";
import { Reveal } from "@/components/motion/reveal";
import type { EventListing } from "@/types/content";

type EventCardProps = {
  event: EventListing;
  delay?: number;
};

export function EventCard({ event, delay }: EventCardProps) {
  const ticket = getTicketAction(event);
  const typeLabel = siteCopy.shared.eventTypes[event.type];

  return (
    <Reveal delay={delay} className="h-full">
      <article className="motion-card flex h-full min-h-[26rem] flex-col gap-6 rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)] sm:p-6">
        <div className="flex min-h-20 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black tracking-[0.08em] text-blood">{typeLabel}</p>
            <h3 className="mt-3 text-2xl font-black leading-tight text-white">{event.title}</h3>
          </div>
        </div>
        <p className="min-h-16 text-sm font-medium leading-6 text-zinc-300">{event.description}</p>
        <div className="grid gap-3 text-sm font-bold sm:grid-cols-2">
          <div>
            <p className="text-xs font-black tracking-[0.08em] text-zinc-500">תאריך</p>
            <p className="mt-1 text-white" dir="ltr">{event.date}</p>
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.08em] text-zinc-500">שעה</p>
            <p className="mt-1 text-blood" dir="ltr">{event.time}</p>
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.08em] text-zinc-500">עיר</p>
            <p className="mt-1 text-zinc-300">{event.location}</p>
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.08em] text-zinc-500">כתובת</p>
            <p className="mt-1 text-zinc-400">{event.address ?? "תתעדכן בקרוב"}</p>
          </div>
        </div>
        <Link
          href={ticket.href}
          className="motion-button mt-auto inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blood px-5 py-3 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] sm:w-fit"
        >
          {ticket.label}
        </Link>
      </article>
    </Reveal>
  );
}

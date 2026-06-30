import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import type { EventListing } from "@/types/content";
import { getTicketAction } from "@/lib/tickets";

type EventCardProps = {
  event: EventListing;
  delay?: number;
};

export function EventCard({ event, delay }: EventCardProps) {
  const ticket = getTicketAction(event);
  const typeLabel = {
    event: "אירוע",
    workshop: "סדנה",
    show: "מופע",
    production: "פרויקט"
  }[event.type];

  return (
    <Reveal delay={delay} className="h-full">
      <article className="grid h-full gap-5 rounded-lg border border-white/10 bg-zinc-950/80 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-blood">{event.date}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{event.title}</h3>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.08em] text-zinc-300">
            {typeLabel}
          </span>
        </div>
        <p className="text-sm leading-6 text-zinc-300">{event.description}</p>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-zinc-400">
          <span>{event.location}</span>
          <span aria-hidden="true">/</span>
          <span>{event.time}</span>
        </div>
        {event.address && (
          <p className="text-xs font-semibold leading-6 text-zinc-500">{event.address}</p>
        )}
        <Link
          href={ticket.href}
          className="mt-auto inline-flex w-fit rounded-full bg-blood px-4 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-black"
        >
          {ticket.label}
        </Link>
      </article>
    </Reveal>
  );
}

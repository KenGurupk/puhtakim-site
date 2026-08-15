"use client";

import { useRef, useState } from "react";

import { TicketCheckoutModal } from "@/components/home/ticket-checkout-modal";
import { Reveal } from "@/components/motion/reveal";
import { siteCopy } from "@/content/site-copy";
import { getCheckoutTicketByPlanId } from "@/lib/checkout-config";
import { getTicketAction } from "@/lib/tickets";
import type { EventListing } from "@/types/content";

type EventCardProps = {
  event: EventListing;
  delay?: number;
  ctaMode?: "checkout" | "scroll-to-tickets";
  statusBadge?: string;
  isCompleted?: boolean;
  isHighlighted?: boolean;
  displayTitle?: string;
  displayDescription?: string;
};

export function EventCard({
  event,
  delay,
  ctaMode = "checkout",
  statusBadge,
  isCompleted = false,
  isHighlighted = false,
  displayTitle,
  displayDescription
}: EventCardProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const ticket = getTicketAction(event);
  const typeLabel = siteCopy.shared.eventTypes[event.type];
  const ticketPlanId =
    event.id === "push-tour-pk-spot"
      ? "beer-sheva-special"
      : event.id === "push-tour-calima"
        ? "calima-single"
        : undefined;
  const checkoutTicket = ticketPlanId ? getCheckoutTicketByPlanId(ticketPlanId) : undefined;
  const canOpenCheckout = !isCompleted && ticket.enabled && event.ticketStatus === "available" && Boolean(checkoutTicket);
  const canUseCta = !isCompleted && ticket.enabled && event.ticketStatus === "available";
  const scrollToTickets = () => {
    const ticketsSection = document.getElementById("tickets");
    if (ticketsSection) {
      const top = ticketsSection.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  };

  return (
    <Reveal delay={delay} className="h-full">
      <article
        className={`motion-card flex h-full min-h-[26rem] min-w-0 flex-col gap-6 rounded-2xl border p-5 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)] sm:p-6 ${
          isHighlighted
            ? "border-blood/45 bg-[linear-gradient(145deg,rgba(193,18,31,0.16),rgba(9,9,9,0.92)_42%,rgba(9,9,9,0.86))]"
            : isCompleted
              ? "border-white/10 bg-zinc-950/55 opacity-[0.78]"
              : "border-white/10 bg-zinc-950/80"
        }`}
      >
        <div className="flex min-h-20 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="break-words text-xs font-black tracking-[0.08em] text-blood">{typeLabel}</p>
            <h3 className="mt-3 break-words text-2xl font-black leading-tight text-white">{displayTitle ?? event.title}</h3>
          </div>
          {statusBadge && (
            <span
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black ${
                isCompleted ? "border-white/15 bg-white/8 text-zinc-200" : "border-blood/40 bg-blood/14 text-white"
              }`}
            >
              {statusBadge}
            </span>
          )}
        </div>
        <p className="min-h-16 break-words text-sm font-medium leading-6 text-zinc-300">{displayDescription ?? event.description}</p>
        <div className="grid min-w-0 gap-3 text-sm font-bold sm:grid-cols-2">
          <div>
            <p className="text-xs font-black tracking-[0.08em] text-zinc-500">תאריך</p>
            <p className="mt-1 text-white" dir="ltr">{event.date}</p>
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.08em] text-zinc-500">שעה</p>
            <p className="mt-1 break-words text-blood [overflow-wrap:anywhere]" dir="ltr">{event.time}</p>
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.08em] text-zinc-500">עיר</p>
            <p className="mt-1 text-zinc-300">{event.location}</p>
          </div>
          <div>
            <p className="text-xs font-black tracking-[0.08em] text-zinc-500">כתובת</p>
            <p className="mt-1 break-words text-zinc-400">{event.address ?? "נעדכן בקרוב"}</p>
          </div>
        </div>
        <button
          ref={buttonRef}
          type="button"
          onPointerDown={() => {
            if (canUseCta && ctaMode === "scroll-to-tickets") {
              scrollToTickets();
            }
          }}
          onClick={() => {
            if (!canUseCta) return;
            if (ctaMode === "scroll-to-tickets") {
              scrollToTickets();
              return;
            }
            if (canOpenCheckout) {
              setIsCheckoutOpen(true);
            }
          }}
          disabled={!canUseCta}
          className="motion-button mt-auto inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blood px-5 py-3 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-400 disabled:hover:translate-y-0 disabled:hover:bg-white/10 disabled:hover:text-zinc-400 sm:w-fit"
        >
          {isCompleted ? "הסתיים בהצלחה" : ticket.label}
        </button>
      </article>
      {ctaMode === "checkout" && isCheckoutOpen && checkoutTicket && (
        <TicketCheckoutModal
          ticket={checkoutTicket}
          returnFocusRef={buttonRef}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </Reveal>
  );
}

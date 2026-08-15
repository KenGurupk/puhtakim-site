"use client";

import { motion, useInView } from "framer-motion";
import { type ReactNode, useRef, useState } from "react";

import { TicketCheckoutModal } from "@/components/home/ticket-checkout-modal";
import { siteCopy } from "@/content/site-copy";
import { getCheckoutTicketByPlanId } from "@/lib/checkout-config";

type TourStop = {
  id: string;
  stop: string;
  city: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  schedule: string;
};

type TourJourneyProps = {
  stops: readonly TourStop[];
};

function getScheduleRows(event: TourStop) {
  if (!event.time.includes("/")) {
    return [{ time: event.time, activity: event.schedule }];
  }

  return event.time.split("/").map((part) => {
    const trimmed = part.trim();
    const match = trimmed.match(/^([\d:–-]+)\s*(.*)$/);

    return {
      time: match?.[1] ?? trimmed,
      activity: match?.[2] || event.schedule
    };
  });
}

function StopField({
  label,
  children,
  className = ""
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}>
      <p className="text-xs font-black tracking-[0.08em] text-zinc-500">{label}</p>
      <div className="mt-2 min-w-0">{children}</div>
    </div>
  );
}

function TourStopCard({ event, index }: { event: TourStop; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const isInView = useInView(ref, { amount: 0.58, margin: "-18% 0px -34% 0px" });
  const scheduleRows = getScheduleRows(event);
  const ticketPlanId =
    event.id === "push-tour-pk-spot"
      ? "beer-sheva-special"
      : event.id === "push-tour-calima"
        ? "calima-single"
        : undefined;
  const checkoutTicket = ticketPlanId ? getCheckoutTicketByPlanId(ticketPlanId) : undefined;
  const isCompleted = event.id === "push-tour-mabuza" || event.id === "push-tour-raiz";

  return (
    <>
      <motion.article
        ref={ref}
        className={`motion-card group relative z-10 flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-black/78 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.38)] backdrop-blur-sm transition-colors duration-300 sm:p-6 ${
          isInView
            ? "border-blood/80 shadow-[0_28px_110px_rgba(193,18,31,0.2)]"
            : "border-white/10"
        }`}
        initial={false}
        animate={{
          y: isInView ? -6 : 0,
          scale: 1
        }}
        whileHover={{
          y: -10,
          rotateX: 0.45,
          rotateY: -0.45
        }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-1 bg-blood"
          initial={false}
          animate={{ opacity: isInView ? 1 : 0.72 }}
        />
        <motion.div
          className="absolute right-4 top-12 z-10 grid size-10 place-items-center rounded-full border border-blood/50 bg-black text-xs font-black text-white shadow-[0_0_34px_rgba(193,18,31,0.32)] lg:right-6"
          initial={false}
          animate={{
            scale: isInView ? 1.08 : 1,
            boxShadow: isInView ? "0 0 42px rgba(193,18,31,0.42)" : "0 0 24px rgba(193,18,31,0.24)"
          }}
          transition={{ duration: 0.3 }}
        >
          {index + 1}
        </motion.div>
        <div className="absolute left-0 top-10 size-24 rounded-full bg-blood/14 blur-3xl transition group-hover:bg-blood/24" aria-hidden="true" />

        <p className="break-words text-xs font-black tracking-[0.08em] text-blood">
          {event.stop}
        </p>

        <div className="mt-7 grid flex-1 gap-3">
          <StopField label="עיר" className="min-h-[6rem]">
            <h3 className="break-words text-4xl font-black leading-tight text-white">{event.city}</h3>
          </StopField>

          <StopField label="אולם" className="min-h-[5rem]">
            <p className="break-words text-2xl font-black text-white/88">{event.venue}</p>
          </StopField>

          <div className="grid grid-cols-2 gap-3">
            <StopField label="תאריך" className="min-h-[5rem]">
              <p className="text-2xl font-black text-white" dir="ltr">{event.date}</p>
            </StopField>
            <StopField label="שעה" className="min-h-[5rem]">
              {event.time && (
                <p className="break-words text-sm font-black leading-6 text-blood [overflow-wrap:anywhere]" dir="ltr">
                  {scheduleRows[0]?.time}
                </p>
              )}
            </StopField>
          </div>

          <StopField label="כתובת" className="min-h-[5.25rem]">
            <p className="break-words text-sm font-bold leading-6 text-zinc-400">{event.address}</p>
          </StopField>

          <StopField label="לו״ז">
            <div className="grid gap-2">
              {scheduleRows.map((row) => (
                <div
                  key={`${event.id}-${row.time}-${row.activity}`}
                  className="grid min-h-[4.25rem] content-start rounded-xl border border-blood/20 bg-black/42 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <p className="break-words text-sm font-black leading-5 text-blood [overflow-wrap:anywhere]" dir="ltr">
                    {row.time}
                  </p>
                  <p className="mt-1 break-words text-sm font-black leading-6 text-white">{row.activity}</p>
                </div>
              ))}
            </div>
          </StopField>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={() => checkoutTicket && setIsCheckoutOpen(true)}
          disabled={!checkoutTicket}
          className="motion-button mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blood px-5 py-3 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCompleted ? "הסתיים בהצלחה" : siteCopy.home.tour.cardCta}
        </button>
      </motion.article>

      {isCheckoutOpen && checkoutTicket && (
        <TicketCheckoutModal
          ticket={checkoutTicket}
          returnFocusRef={buttonRef}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </>
  );
}

export function TourJourney({ stops }: TourJourneyProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative mt-16 grid min-w-0 gap-7 overflow-hidden sm:grid-cols-2 lg:grid-cols-4 lg:gap-5" style={{ position: "relative" }}>
      <div className="pointer-events-none absolute bottom-auto right-6 top-0 h-full w-px overflow-hidden bg-blood/12 sm:hidden" aria-hidden="true">
        <div className="h-full w-full bg-gradient-to-b from-blood/0 via-blood/70 to-blood/0" />
      </div>
      <div className="pointer-events-none absolute left-0 right-0 top-16 hidden h-px overflow-hidden bg-blood/12 lg:block" aria-hidden="true">
        <div className="h-full w-full bg-gradient-to-l from-blood/0 via-blood/70 to-blood/0" />
      </div>
      {stops.map((event, index) => (
        <TourStopCard key={event.id} event={event} index={index} />
      ))}
    </div>
  );
}

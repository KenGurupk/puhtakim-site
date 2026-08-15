"use client";

import { useEffect, useRef, useState } from "react";

import { TicketCheckoutModal } from "@/components/home/ticket-checkout-modal";
import { getCheckoutTicketByPlanId } from "@/lib/checkout-config";

type TicketPlan = {
  id: string;
  eyebrow: string;
  title: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  saving?: string;
  event?: string;
  offerText?: string;
  returnText?: string;
  availabilityKey?: string;
  description: string;
  benefits: readonly string[];
  cta: string;
  featured?: boolean;
};

type TicketAvailability = {
  total: number;
  sold: number;
  remaining: number;
  status: string;
  isSoldOut?: boolean;
  source?: "database" | "override";
};

type TicketPlanCardProps = {
  plan: TicketPlan;
  role: string;
  availability?: TicketAvailability;
  emphasis?: "bundle" | "standard";
};

export function TicketPlanCard({ plan, role, availability, emphasis }: TicketPlanCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [liveAvailability, setLiveAvailability] = useState<TicketAvailability | undefined>(availability);
  const [availabilityState, setAvailabilityState] = useState<"idle" | "loading" | "ready" | "error">(
    availability ? "ready" : "idle"
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isFeatured = Boolean(plan.featured);
  const isLaunchOffer = plan.id === "mabuza-early-bird";
  const isBundleEmphasis = emphasis === "bundle" || plan.id === "three-halls" || plan.id === "ultimate";
  const checkoutTicket = getCheckoutTicketByPlanId(plan.id);
  const currentAvailability = isLaunchOffer ? liveAvailability : availability;
  const isAvailabilityUnavailable = isLaunchOffer && availabilityState !== "ready";
  const isSoldOut = Boolean(checkoutTicket?.salesClosed) || currentAvailability?.isSoldOut || currentAvailability?.status === "sold_out" || currentAvailability?.remaining === 0;
  const isPurchaseDisabled = !checkoutTicket || isSoldOut || isAvailabilityUnavailable;
  const purchaseButtonText = isSoldOut ? "🔥 כל כרטיסי הפתיחה נחטפו!" : isAvailabilityUnavailable ? "בודקים זמינות כרטיסים…" : plan.cta;
  const isSoldOutLaunchOffer = isLaunchOffer && isSoldOut;

  useEffect(() => {
    if (!isLaunchOffer) {
      return;
    }

    let active = true;
    setAvailabilityState("loading");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    fetch("/api/tickets/availability", { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("availability_unavailable"))))
      .then((payload: { earlyBirdMabuza?: TicketAvailability } | null) => {
        if (active && payload?.earlyBirdMabuza) {
          setLiveAvailability(payload.earlyBirdMabuza);
          setAvailabilityState("ready");
        }
      })
      .catch(() => {
        if (active) {
          setLiveAvailability(undefined);
          setAvailabilityState("error");
        }
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isLaunchOffer]);

  return (
    <>
      <article
        data-ticket-plan-id={plan.id}
        className={`motion-card group relative flex h-full min-h-[44rem] flex-col overflow-hidden rounded-2xl border p-6 transition duration-300 hover:-translate-y-1.5 sm:p-7 ${isBundleEmphasis ? "bundle-choice-card" : ""} ${
          isLaunchOffer
            ? isSoldOut
              ? "border-white/15 bg-[linear-gradient(145deg,rgba(55,65,81,0.32),rgba(255,255,255,0.045)_48%,rgba(193,18,31,0.16))] opacity-95 shadow-[0_30px_110px_rgba(0,0,0,0.28)]"
              : "border-amber-300/45 bg-[linear-gradient(145deg,rgba(193,18,31,0.28),rgba(255,255,255,0.07)_48%,rgba(245,158,11,0.16))] shadow-[0_30px_110px_rgba(193,18,31,0.18)] hover:border-amber-200/70 hover:shadow-[0_36px_130px_rgba(245,158,11,0.18)]"
            : isFeatured
              ? "border-amber-300/45 bg-[linear-gradient(145deg,rgba(193,18,31,0.25),rgba(255,255,255,0.07)_45%,rgba(245,158,11,0.12))] shadow-[0_32px_120px_rgba(245,158,11,0.17)] hover:shadow-[0_36px_130px_rgba(245,158,11,0.22)] lg:scale-[1.045]"
              : isBundleEmphasis
                ? "border-amber-300/38 bg-[linear-gradient(145deg,rgba(245,158,11,0.13),rgba(255,255,255,0.058)_46%,rgba(193,18,31,0.1))] shadow-[0_28px_105px_rgba(245,158,11,0.14)] hover:border-amber-200/65 hover:shadow-[0_34px_125px_rgba(245,158,11,0.2)]"
                : "border-white/20 bg-white/[0.055] shadow-[0_24px_90px_rgba(0,0,0,0.36)] hover:border-blood/70 hover:shadow-[0_28px_105px_rgba(193,18,31,0.18)]"
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-blood via-red-900 to-transparent" />
        {(isFeatured || isLaunchOffer) && (
          <div className="absolute inset-x-6 top-0 h-24 bg-amber-300/10 blur-3xl" aria-hidden="true" />
        )}
        <div className="relative">
          {isSoldOutLaunchOffer ? (
            <div className="rounded-2xl border border-blood/45 bg-[linear-gradient(135deg,rgba(39,39,42,0.98),rgba(127,29,29,0.42))] p-5 text-center shadow-[0_0_44px_rgba(193,18,31,0.22)]">
              <p className="text-2xl font-black leading-none tracking-[0.1em] text-white sm:text-3xl">
                SOLD OUT 🔥
              </p>
              <p className="mt-3 text-base font-black leading-7 text-zinc-100">
                כרטיסי הפתיחה נחטפו.
              </p>
            </div>
          ) : (
            <div className="grid min-h-24 content-start gap-3">
              <p className="text-center text-xs font-black leading-5 tracking-[0.08em] text-blood sm:text-right">
                {plan.eyebrow}
              </p>
              <div className="flex min-h-8 flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-3.5 py-1 text-center text-xs font-black leading-none ${isFeatured || isLaunchOffer ? "bg-amber-300 text-black" : isBundleEmphasis ? "bg-amber-300/16 text-amber-100 ring-1 ring-amber-300/28" : "bg-white/10 text-white/78"}`}>
                  {role}
                </span>
                {plan.badge && (
                  <span className="inline-flex min-h-9 items-center justify-center rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1.5 text-center text-sm font-black leading-none tracking-[0.08em] text-amber-200">
                    {plan.badge}
                  </span>
                )}
              </div>
            </div>
          )}
          <h3 className="mt-6 min-h-20 text-3xl font-black leading-tight text-white">{plan.title}</h3>
          {plan.event && (
            <p className="mt-3 rounded-2xl border border-white/10 bg-black/28 px-4 py-3 text-sm font-black leading-6 text-white/82">
              {plan.event}
            </p>
          )}
          <div className={`mt-6 flex min-h-16 flex-wrap items-end gap-3 ${isSoldOutLaunchOffer ? "opacity-45" : ""}`}>
            <p className="text-6xl font-black leading-none text-white" dir="ltr">
              {plan.price}
            </p>
            {plan.originalPrice && (
              <p className="pb-2 text-2xl font-black text-zinc-500 line-through" dir="ltr">
                {plan.originalPrice}
              </p>
            )}
          </div>
          <div className="mt-4 grid min-h-12 gap-3">
            {plan.saving && (
              <p className="w-fit rounded-full bg-amber-300/12 px-4 py-2 text-sm font-black text-amber-200">
                {plan.saving}
              </p>
            )}
            {currentAvailability && (
              <p className={`w-fit rounded-full border px-4 py-2 text-sm font-black text-white ${isSoldOut ? "border-white/15 bg-zinc-900/70" : "border-blood/50 bg-blood/14"}`}>
                {isSoldOut ? (
                  <span className="text-white drop-shadow-[0_0_16px_rgba(193,18,31,0.4)]">🎉 כרטיסי הפתיחה אזלו!</span>
                ) : (
                  <>
                    נשארו{" "}
                    <span className="text-blood drop-shadow-[0_0_16px_rgba(193,18,31,0.65)]">
                      {currentAvailability.remaining} מתוך {currentAvailability.total}
                    </span>{" "}
                    כרטיסים מוזלים
                  </>
                )}
              </p>
            )}
            {isLaunchOffer && availabilityState !== "ready" && (
              <p className="w-fit rounded-full border border-amber-300/35 bg-amber-300/10 px-4 py-2 text-sm font-black text-amber-100">
                בודקים זמינות כרטיסים…
              </p>
            )}
          </div>
          {plan.offerText && (
            <p className="mt-5 text-base font-black leading-7 text-white">
              {plan.offerText}
            </p>
          )}
          {plan.returnText && (
            <p className="mt-2 text-sm font-bold leading-6 text-amber-200">
              {plan.returnText}
            </p>
          )}
          <p className="mt-6 min-h-28 text-base font-medium leading-7 text-zinc-300">{plan.description}</p>
        </div>

        <ul className="relative mt-7 grid min-h-36 gap-3 text-sm font-bold leading-6 text-zinc-200">
          {plan.benefits.map((benefit) => (
            <li key={benefit} className="flex gap-3">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blood shadow-[0_0_20px_rgba(193,18,31,0.8)]" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {!isSoldOutLaunchOffer && (
          <button
            ref={buttonRef}
            type="button"
            onClick={() => !isPurchaseDisabled && setIsOpen(true)}
            disabled={isPurchaseDisabled}
            className={`motion-button relative mt-auto inline-flex min-h-14 w-full items-center justify-center rounded-2xl px-6 py-4 text-center text-base font-black transition duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
              isFeatured || isLaunchOffer
              ? "bg-amber-300 text-black shadow-[0_18px_70px_rgba(245,158,11,0.24)] hover:bg-white hover:shadow-[0_24px_90px_rgba(245,158,11,0.28)]"
              : "bg-blood text-white shadow-[0_18px_70px_rgba(193,18,31,0.22)] hover:bg-white hover:text-black hover:shadow-[0_22px_86px_rgba(193,18,31,0.24)]"
            }`}
          >
            {purchaseButtonText}
          </button>
        )}
      </article>

      {isOpen && checkoutTicket && (
        <TicketCheckoutModal
          ticket={checkoutTicket}
          returnFocusRef={buttonRef}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

export function ArchivedTicketCard({
  plan,
  label,
  note,
  crossed = false
}: {
  plan: TicketPlan;
  label: string;
  note: string;
  crossed?: boolean;
}) {
  return (
    <article
      data-ticket-plan-id={`${plan.id}-archived`}
      className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.035] p-4 text-right opacity-85 shadow-[0_16px_55px_rgba(0,0,0,0.24)] sm:p-5"
      aria-label={`${plan.title} - ${label}`}
    >
      {crossed && (
        <div className="pointer-events-none absolute inset-x-4 top-1/2 h-0.5 -rotate-6 bg-blood/80 shadow-[0_0_20px_rgba(193,18,31,0.35)]" aria-hidden="true" />
      )}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.12em] text-zinc-500">{plan.eyebrow}</p>
          <h3 className="mt-2 text-xl font-black leading-tight text-white">{plan.title}</h3>
          <p className="mt-2 text-sm font-black leading-6 text-zinc-300">{note}</p>
        </div>
        <div className="shrink-0 text-right sm:text-left">
          <p className="inline-flex rounded-full border border-blood/45 bg-zinc-900/85 px-4 py-2 text-sm font-black text-white shadow-[0_0_28px_rgba(193,18,31,0.16)]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-white/35 line-through" dir="ltr">
            {plan.price}
          </p>
        </div>
      </div>
    </article>
  );
}

export function SoldOutTicketMessage() {
  function scrollToAvailableTickets() {
    const target = document.querySelector<HTMLElement>('[data-ticket-plan-id="single"]');
    const availableGrid = document.getElementById("available-ticket-options");

    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }

    if (availableGrid) {
      availableGrid.classList.remove("ticket-options-highlight");
      window.setTimeout(() => availableGrid.classList.add("ticket-options-highlight"), 120);
      window.setTimeout(() => availableGrid.classList.remove("ticket-options-highlight"), 1700);
    }
  }

  return (
    <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-300/24 bg-[linear-gradient(145deg,rgba(245,158,11,0.12),rgba(255,255,255,0.045)_52%,rgba(193,18,31,0.12))] p-6 text-center shadow-[0_24px_90px_rgba(245,158,11,0.12)]">
      <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full border border-amber-300/35 bg-amber-300/12 text-5xl text-amber-200 shadow-[0_0_42px_rgba(245,158,11,0.18)] motion-safe:animate-[bounce_1.2s_ease-in-out_infinite]" aria-hidden="true">
        ↓
      </div>
      <p className="text-2xl font-black leading-9 text-white">אבל המסע רק מתחיל.</p>
      <p className="mx-auto mt-4 max-w-2xl text-base font-bold leading-7 text-amber-100">
        נשארו כרטיסים לאירוע וכרטיסים משולבים שחוסכים יותר ככל שמגיעים ליותר תחנות.
      </p>
      <button
        type="button"
        onClick={scrollToAvailableTickets}
        className="motion-button mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl border border-amber-200/45 bg-amber-300 px-5 py-3 text-sm font-black text-black shadow-[0_18px_70px_rgba(245,158,11,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_24px_90px_rgba(245,158,11,0.28)] active:scale-[0.98]"
      >
        לכרטיסים שעדיין זמינים ↓
      </button>
    </div>
  );
}


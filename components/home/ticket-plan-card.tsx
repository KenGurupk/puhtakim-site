"use client";

import Link from "next/link";
import { useState } from "react";

type TicketPlan = {
  id: string;
  eyebrow: string;
  title: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  saving?: string;
  description: string;
  benefits: readonly string[];
  cta: string;
  href: string;
  featured?: boolean;
};

type HealthCopy = {
  title: string;
  modalTitle: string;
  text: readonly string[];
  note: string;
  fitnessCheckbox: string;
  termsCheckbox: string;
  continueCta: string;
  readFull: string;
};

type TicketPlanCardProps = {
  plan: TicketPlan;
  role: string;
  health: HealthCopy;
};

export function TicketPlanCard({ plan, role, health }: TicketPlanCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fitnessConfirmed, setFitnessConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const [showFullStatement, setShowFullStatement] = useState(false);
  const isFeatured = Boolean(plan.featured);
  const canContinue = fitnessConfirmed && termsConfirmed;

  function closeModal() {
    setIsOpen(false);
    setFitnessConfirmed(false);
    setTermsConfirmed(false);
    setShowFullStatement(false);
  }

  return (
    <>
      <article
        className={`motion-card group relative flex h-full min-h-[44rem] flex-col overflow-hidden rounded-2xl border p-6 transition duration-300 hover:-translate-y-1.5 sm:p-7 ${
          isFeatured
            ? "border-amber-300/45 bg-[linear-gradient(145deg,rgba(193,18,31,0.25),rgba(255,255,255,0.07)_45%,rgba(245,158,11,0.12))] shadow-[0_32px_120px_rgba(245,158,11,0.17)] hover:shadow-[0_36px_130px_rgba(245,158,11,0.22)] lg:scale-[1.045]"
            : "border-white/10 bg-white/[0.045] shadow-[0_20px_80px_rgba(0,0,0,0.34)] hover:border-blood/60 hover:shadow-[0_26px_100px_rgba(193,18,31,0.14)]"
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-blood via-red-900 to-transparent" />
        {isFeatured && (
          <div className="absolute inset-x-6 top-0 h-24 bg-amber-300/10 blur-3xl" aria-hidden="true" />
        )}
        <div className="relative">
          <div className="grid min-h-24 content-start gap-3">
            <p className="text-center text-xs font-black leading-5 tracking-[0.08em] text-blood sm:text-right">
              {plan.eyebrow}
            </p>
            <div className="flex min-h-8 flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className={`inline-flex min-h-8 items-center justify-center rounded-full px-3.5 py-1 text-center text-xs font-black leading-none ${isFeatured ? "bg-amber-300 text-black" : "bg-white/10 text-white/78"}`}>
                {role}
              </span>
              {plan.badge && (
                <span className="inline-flex min-h-8 items-center justify-center rounded-full border border-amber-300/40 bg-amber-300/10 px-3.5 py-1 text-center text-xs font-black leading-none text-amber-200">
                  {plan.badge}
                </span>
              )}
            </div>
          </div>
          <h3 className="mt-6 min-h-20 text-3xl font-black leading-tight text-white">{plan.title}</h3>
          <div className="mt-6 flex min-h-16 flex-wrap items-end gap-3">
            <p className="text-6xl font-black leading-none text-white" dir="ltr">
              {plan.price}
            </p>
            {plan.originalPrice && (
              <p className="pb-2 text-2xl font-black text-zinc-500 line-through" dir="ltr">
                {plan.originalPrice}
              </p>
            )}
          </div>
          <div className="mt-4 flex min-h-12 items-start">
            {plan.saving && (
              <p className="w-fit rounded-full bg-amber-300/12 px-4 py-2 text-sm font-black text-amber-200">
                {plan.saving}
              </p>
            )}
          </div>
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

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`motion-button relative mt-auto inline-flex min-h-14 w-full items-center justify-center rounded-2xl px-6 py-4 text-center text-base font-black transition duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
            isFeatured
              ? "bg-amber-300 text-black shadow-[0_18px_70px_rgba(245,158,11,0.24)] hover:bg-white hover:shadow-[0_24px_90px_rgba(245,158,11,0.28)]"
              : "bg-blood text-white shadow-[0_18px_70px_rgba(193,18,31,0.22)] hover:bg-white hover:text-black hover:shadow-[0_22px_86px_rgba(193,18,31,0.24)]"
          }`}
        >
          {plan.cta}
        </button>
      </article>

      {isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/82 px-5 py-8 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby={`ticket-modal-${plan.id}`}>
          <div className="relative max-h-[calc(100vh-4rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#070707] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:p-8">
            <button
              type="button"
              onClick={closeModal}
              className="motion-button absolute left-4 top-4 grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-xl font-black text-white transition hover:bg-white hover:text-black"
              aria-label="סגור"
            >
              ×
            </button>
            <p className="text-sm font-black tracking-[0.08em] text-blood">
              {plan.title}
            </p>
            <h3 id={`ticket-modal-${plan.id}`} className="mt-4 text-4xl font-black leading-tight text-white">
              {health.modalTitle}
            </h3>
            <div className="mt-7 grid gap-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-bold leading-6 text-zinc-200 transition hover:border-blood/50">
                <input
                  type="checkbox"
                  checked={fitnessConfirmed}
                  onChange={(event) => setFitnessConfirmed(event.target.checked)}
                  className="mt-1 size-5 shrink-0 accent-[#c1121f]"
                />
                <span>{health.fitnessCheckbox}</span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm font-bold leading-6 text-zinc-200 transition hover:border-blood/50">
                <input
                  type="checkbox"
                  checked={termsConfirmed}
                  onChange={(event) => setTermsConfirmed(event.target.checked)}
                  className="mt-1 size-5 shrink-0 accent-[#c1121f]"
                />
                <span>{health.termsCheckbox}</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowFullStatement((current) => !current)}
              className="mt-5 text-sm font-black text-blood transition hover:text-white"
            >
              {health.readFull}
            </button>

            <div className={`grid transition-[grid-template-rows] duration-300 ${showFullStatement ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/36 p-4">
                  <p className="text-sm font-black text-white">{health.title}</p>
                  <ul className="mt-3 grid gap-2 text-sm font-medium leading-6 text-zinc-300">
                    {health.text.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs font-bold leading-6 text-zinc-500">{health.note}</p>
                </div>
              </div>
            </div>

            {canContinue ? (
              <Link
                href={plan.href}
                className="motion-button mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-blood px-6 py-4 text-center text-base font-black text-white shadow-[0_18px_70px_rgba(193,18,31,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]"
              >
                {health.continueCta}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-7 inline-flex min-h-14 w-full cursor-not-allowed items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-center text-base font-black text-zinc-500"
              >
                {health.continueCta}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

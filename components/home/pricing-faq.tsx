"use client";

import { useState } from "react";

type PricingFaqProps = {
  title: string;
  items: ReadonlyArray<{
    question: string;
    answer: string;
  }>;
};

export function PricingFaq({ title, items }: PricingFaqProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mt-14 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <div className="max-w-xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-blood">
          לפני שנכנסים
        </p>
        <h3 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">
          {title}
        </h3>
      </div>
      <div className="grid gap-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.question}
              className="rounded-2xl border border-white/10 bg-black/54 shadow-[0_18px_70px_rgba(0,0,0,0.26)] transition duration-300 hover:-translate-y-0.5 hover:border-blood/55 hover:shadow-[0_22px_80px_rgba(193,18,31,0.12)]"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`pricing-faq-${index}`}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-right text-base font-black text-white outline-none transition focus-visible:ring-2 focus-visible:ring-blood/70"
              >
                <span>{item.question}</span>
                <span className="relative grid size-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-blood transition duration-300">
                  <span className="absolute h-0.5 w-3.5 rounded-full bg-current" />
                  <span
                    className={`absolute h-3.5 w-0.5 rounded-full bg-current transition duration-300 ${
                      isOpen ? "scale-y-0" : "scale-y-100"
                    }`}
                  />
                </span>
              </button>
              <div
                id={`pricing-faq-${index}`}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm font-medium leading-7 text-zinc-300">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

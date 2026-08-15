import { PricingFaq } from "@/components/home/pricing-faq";
import { TicketPlanCard } from "@/components/home/ticket-plan-card";
import { Reveal } from "@/components/motion/reveal";
import { siteCopy } from "@/content/site-copy";

const pricing = siteCopy.home.pricing;

type PushTourPricingProps = {
  title?: string;
  subtitle?: string;
  question?: string | null;
  valueLine?: string;
  showFaq?: boolean;
};

export function PushTourPricing({ title, subtitle, question, valueLine, showFaq = true }: PushTourPricingProps = {}) {
  const questionText = question === undefined ? pricing.question : question;
  const availablePlans = pricing.plans.filter((plan) => plan.id === "beer-sheva-special" || plan.id === "calima-single");

  return (
    <section id="tickets" className="relative isolate overflow-hidden border-b border-white/10 bg-black px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_76%_10%,rgba(193,18,31,0.22),transparent_28rem),radial-gradient(circle_at_20%_74%,rgba(245,158,11,0.12),transparent_24rem),linear-gradient(180deg,#050505_0%,#0b0b0b_50%,#050505_100%)]" />
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-blood">
              PUSH TOUR 2026
            </p>
            <h2 className="mt-6 whitespace-pre-line text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              {title ?? pricing.title}
            </h2>
            <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-zinc-300 sm:text-xl">
              {subtitle ?? pricing.subtitle}
            </p>
            {valueLine && (
              <p className="mt-5 max-w-3xl rounded-2xl border border-blood/35 bg-blood/10 px-5 py-4 text-base font-black leading-7 text-white shadow-[0_20px_80px_rgba(193,18,31,0.12)]">
                {valueLine}
              </p>
            )}
          </div>
        </Reveal>

        {questionText && (
          <Reveal delay={0.08}>
            <p className="mt-16 text-center text-3xl font-black tracking-tight text-white sm:text-5xl">
              {questionText}
            </p>
          </Reveal>
        )}

        <div id="available-ticket-options" className="bundle-choice-grid mt-12 grid gap-5 md:grid-cols-2 md:items-stretch">
          {availablePlans.map((plan, index) => {
            const role = plan.id === "beer-sheva-special" ? "התחנה הבאה" : "אירוע הסיום";
            const availability = undefined;

            return (
              <Reveal key={plan.id} delay={index * 0.09} className="h-full">
                <TicketPlanCard
                  plan={plan}
                  role={role}
                  availability={availability}
                  emphasis={plan.id === "beer-sheva-special" ? "bundle" : "standard"}
                />
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.12}>
          <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.32)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] border-collapse text-right">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.025]">
                    <th className="px-6 py-6 text-sm font-black text-blood">מה מתאים לכם?</th>
                    {pricing.comparison.columns.map((column) => (
                      <th key={column} className="px-6 py-6 text-sm font-black text-white">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricing.comparison.rows.map((row) => (
                    <tr key={row.label} className="border-b border-white/10 transition duration-300 hover:bg-white/[0.045] last:border-b-0">
                      <td className="px-6 py-5 text-sm font-black text-zinc-300">
                        <span className="ml-2 inline-block size-1.5 rounded-full bg-blood align-middle" aria-hidden="true" />
                        {row.label}
                      </td>
                      {row.values.map((value, index) => (
                        <td
                          key={`${row.label}-${index}`}
                          className={`px-6 py-5 text-sm font-bold ${
                            index === 2 ? "text-amber-200" : "text-white/82"
                          }`}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {showFaq && (
          <Reveal delay={0.14}>
            <PricingFaq title={pricing.faq.title} items={pricing.faq.items} />
          </Reveal>
        )}
      </div>
    </section>
  );
}

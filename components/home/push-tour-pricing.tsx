import { PricingFaq } from "@/components/home/pricing-faq";
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

  return (
    <section id="tickets" className="relative isolate overflow-hidden border-b border-white/10 bg-black px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_76%_10%,rgba(193,18,31,0.22),transparent_28rem),radial-gradient(circle_at_20%_74%,rgba(245,158,11,0.12),transparent_24rem),linear-gradient(180deg,#050505_0%,#0b0b0b_50%,#050505_100%)]" />
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-blood">PUSH TOUR 2026</p>
            <h2 className="mt-6 whitespace-pre-line text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              {title ?? "Push Tour 2026 הסתיים ❤️‍🔥"}
            </h2>
            <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-zinc-300 sm:text-xl">
              {subtitle ?? "ארבעה אולמות, קהילות מכל הארץ והמון רגעים שניקח איתנו הלאה. מכירת הכרטיסים לסבב הסתיימה."}
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
            <p className="mt-16 text-center text-3xl font-black tracking-tight text-white sm:text-5xl">{questionText}</p>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <div className="mt-12 max-w-4xl rounded-3xl border border-white/12 bg-white/[0.045] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.34)] sm:p-9">
            <p className="text-sm font-black tracking-[0.14em] text-blood">ההרשמה נסגרה</p>
            <h3 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">כל אירועי Push Tour 2026 הסתיימו.</h3>
            <p className="mt-5 max-w-3xl text-base font-bold leading-8 text-zinc-300 sm:text-lg">
              תודה ענקית לכל מי שהתאמן, התחרה, עזר, צילם, הרים, אירח, נתן חסות ופשוט היה חלק מהמסע הזה. אין כרגע כרטיסים פעילים לרכישה באתר.
            </p>
            <p className="mt-4 text-base font-black leading-7 text-amber-200">אנחנו רק מתחממים. האירוע הבא כבר בדרך.</p>
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

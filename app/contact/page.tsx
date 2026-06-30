import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "צור קשר",
  description: "צרו קשר עם PushTakim להזמנות, סדנאות, הפקות ושיתופי פעולה."
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="צור קשר"
        title="יש לכם מרחב, רעיון או קהילה?"
        description="כתבו לנו מה אתם רוצים לבנות יחד, ואנחנו נחזור עם השלב הבא."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-blood">לפני ששולחים</p>
            <h2 className="mt-4 text-3xl font-black text-white">מה כדאי לכלול?</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              תאריך, עיר, סוג אירוע, כמות משתתפים, גילאים, תקציב משוער, ומה אתם רוצים שאנשים ירגישו בסוף.
            </p>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}

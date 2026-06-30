import type { Metadata } from "next";
import Link from "next/link";
import { FeatureCard } from "@/components/cards/feature-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { productionServices } from "@/data/content";

export const metadata: Metadata = {
  title: "פרויקטים",
  description: "פרויקטי תנועה, הפקות ותוכן של PushTakim."
};

export default function ProductionsPage() {
  return (
    <>
      <PageHero
        eyebrow="פרויקטים"
        title="כשצריך להפוך רעיון לתנועה אמיתית."
        description="PushTakim בונה פרויקטים שמחברים אנשים, מרחב, צילום, במה וקהילה."
      />
      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {productionServices.map((service, index) => (
            <FeatureCard key={service.title} {...service} delay={index * 0.08} />
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-4xl font-black text-white sm:text-5xl">מה אפשר לבנות יחד?</h2>
            <div className="mt-8 grid gap-3 text-sm font-bold text-zinc-300">
              {["אירוע קהילה", "קמפיין וידאו", "סדנת חברה", "מופע פתיחה", "פרויקט עירוני"].map((item) => (
                <p key={item} className="border-r-2 border-blood pr-4">{item}</p>
              ))}
            </div>
            <Link href="/contact" className="mt-8 inline-flex bg-blood px-7 py-4 text-base font-black text-white transition hover:bg-white hover:text-black">
              מתחילים שיחה
            </Link>
          </div>
          <MediaFrame label="תמונות פרויקט / מאחורי הקלעים" className="min-h-[28rem]" />
        </div>
      </Section>
    </>
  );
}

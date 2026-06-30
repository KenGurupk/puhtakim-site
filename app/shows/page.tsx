import type { Metadata } from "next";
import Link from "next/link";
import { FeatureCard } from "@/components/cards/feature-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { shows } from "@/data/content";

export const metadata: Metadata = {
  title: "מופעים ופעלולים",
  description: "מופעי תנועה, אקשן ופרפורמנס של PushTakim."
};

export default function ShowsPage() {
  return (
    <>
      <PageHero
        eyebrow="מופעים ופעלולים"
        title="תנועה שמרגישים גם מהשורה האחרונה."
        description="מופעים, שואוקייסים, פעלולים ותוכן חי שמביאים את תרבות התנועה אל הבמה והמצלמה."
      />
      <Section>
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <MediaFrame label="וידאו מופע / פעלולים" className="min-h-[30rem]" />
          <div className="grid gap-4">
            {shows.map((show, index) => (
              <FeatureCard key={show.title} {...show} delay={index * 0.08} />
            ))}
          </div>
        </div>
      </Section>
      <Section
        eyebrow="בוקינג"
        title="אירוע צריך רגע שאנשים יזכרו."
        description="אפשר לבנות מופע קצר, הופעת רחוב, פריצה לבמה, תוכן וידאו או קונספט תנועה מלא."
      >
        <Link href="/contact" className="inline-flex bg-blood px-7 py-4 text-base font-black text-white transition hover:bg-white hover:text-black">
          לבוקינג
        </Link>
      </Section>
    </>
  );
}

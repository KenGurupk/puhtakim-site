import type { Metadata } from "next";
import Link from "next/link";
import { FeatureCard } from "@/components/cards/feature-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "קהילה",
  description: "קהילת התנועה של PushTakim בישראל."
};

const communityTracks = [
  {
    meta: "כניסה",
    title: "מפגשים פתוחים",
    description: "מרחב להגיע אליו גם בלי להכיר אף אחד, לראות, לשאול, לנסות ולהתחבר בקצב שלך."
  },
  {
    meta: "אימון",
    title: "סשנים משותפים",
    description: "אימונים שבהם מתקדמים ומתחילים נמצאים באותו מרחב, עם עזרה, ספוטינג ואנרגיה טובה."
  },
  {
    meta: "תרבות",
    title: "קהילה שבונה קהילה",
    description: "אנשים שמגיעים ממקצועות תנועה שונים ומביאים איתם שפה, מוזיקה, צחוק ודרך חיים."
  }
];

export default function CommunityPage() {
  return (
    <>
      <PageHero
        eyebrow="קהילה"
        title="המקום שבו אנשים זזים ביחד."
        description="PushTakim מחברת בין אנשים דרך תנועה, בלי מבחני כניסה ובלי צורך להיות משהו שאתה לא."
      />
      <Section>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <MediaFrame label="תמונת קהילה / סשן פתוח" className="min-h-[26rem]" />
          <div className="grid gap-4">
            {communityTracks.map((track, index) => (
              <FeatureCard key={track.title} {...track} delay={index * 0.06} />
            ))}
          </div>
        </div>
      </Section>
      <Section
        eyebrow="איך מצטרפים"
        title="פשוט מגיעים."
        description="הדרך הכי טובה להבין את PushTakim היא להגיע למפגש, לעמוד בצד רגע, ואז להיכנס לתנועה."
      >
        <Link href="/events" className="inline-flex bg-blood px-7 py-4 text-base font-black text-white transition hover:bg-white hover:text-black">
          לאירועים הקרובים
        </Link>
      </Section>
    </>
  );
}

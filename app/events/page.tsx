import type { Metadata } from "next";
import { EventCard } from "@/components/cards/event-card";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { events } from "@/data/content";

export const metadata: Metadata = {
  title: "אירועים ומפגשים",
  description: "אירועי PushTakim, מפגשי קהילה וסדרת Push Tour 2026."
};

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="אירועים ומפגשים"
        title="המקום שבו הקהילה נהיית אמיתית."
        description="אירועים, סדנאות, אימונים פתוחים ואתגרים שמפגישים בין אנשים שאוהבים לזוז."
      />
      <Section>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <MediaFrame label="וידאו / תמונת אווירה מהאירוע הבא" className="min-h-[28rem]" />
          <div className="grid gap-4">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} delay={index * 0.05} />
            ))}
          </div>
        </div>
      </Section>
      <Section
        eyebrow="מערכת כרטיסים"
        title="מוכן לחיבור עתידי."
        description="האירועים כבר בנויים סביב סטטוסים, פעולות כרטיסים ו־API פנימי, כך שאפשר לחבר בהמשך ספק כרטיסים אמיתי בלי לפרק את האתר."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {["כרטיסים", "רשימות המתנה", "התראות"].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
              <p className="text-2xl font-black text-white">{item}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

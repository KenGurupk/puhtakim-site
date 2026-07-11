import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { MediaFrame } from "@/components/ui/media-frame";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";
import { pageMedia } from "@/lib/section-media-manifest";

const copy = siteCopy.pages.contact;

export const metadata: Metadata = copy.metadata;

export default function ContactPage() {
  return (
    <>
      <PageHero {...copy.hero} />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-6">
            <div className="motion-card rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
              <p className="text-sm font-black tracking-[0.12em] text-blood">{copy.before.eyebrow}</p>
              <h2 className="mt-5 text-3xl font-black leading-tight text-white">{copy.before.title}</h2>
              <p className="mt-6 text-sm font-medium leading-7 text-zinc-300">
                {copy.before.text}
              </p>
            </div>
            <MediaFrame
              src={pageMedia.contact.src}
              alt={pageMedia.contact.alt}
              fit={pageMedia.contact.fit}
              label="רגע קטן מהשטח, לפני שמתחילים לדבר על הפרויקט הבא"
              className="min-h-[20rem] lg:aspect-[4/3]"
              position="center top"
            />
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}

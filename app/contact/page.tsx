import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";
import { siteCopy } from "@/content/site-copy";

const copy = siteCopy.pages.contact;

export const metadata: Metadata = copy.metadata;

export default function ContactPage() {
  return (
    <>
      <PageHero {...copy.hero} />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-blood">{copy.before.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-black text-white">{copy.before.title}</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              {copy.before.text}
            </p>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}

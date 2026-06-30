import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/ui/page-hero";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "מדריכים חינמיים | PushTakim",
  description: "מדריכים קצרים מהיוטיוב של PushTakim כדי להתחיל לזוז, להשתפר ולהכיר את עולם התנועה."
};

export default function GuidesPage() {
  return (
    <>
      <PageHero
        eyebrow="מדריכים חינמיים"
        title="מדריכים חינמיים"
        description="רוצים להתחיל לזוז כבר עכשיו? הכנו עבורכם מדריכים קצרים מהיוטיוב שלנו שיעזרו לכם ללמוד, להשתפר ולהכיר את עולם התנועה."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <div className="space-y-5 text-lg leading-8 text-zinc-300">
              <p>רוצים להתחיל לזוז כבר עכשיו?</p>
              <p>
                הכנו עבורכם מדריכים קצרים מהיוטיוב שלנו שיעזרו לכם ללמוד, להשתפר ולהכיר את עולם התנועה.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-card sm:max-w-md lg:max-w-none">
              <div className="aspect-[9/16] w-full bg-[radial-gradient(circle_at_50%_18%,rgba(127,29,29,0.45),transparent_34%),linear-gradient(180deg,rgba(24,24,27,0.95),rgba(0,0,0,1))] p-6">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-black/35 p-5">
                  <span className="w-fit rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-ember">
                    YouTube Shorts
                  </span>
                  <div>
                    <p className="text-3xl font-black text-white">Shorts</p>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">מדריכים קצרים יופיעו כאן</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

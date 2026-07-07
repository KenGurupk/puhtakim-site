import { Reveal } from "@/components/motion/reveal";

type FeatureCardProps = {
  title: string;
  description: string;
  meta?: string;
  delay?: number;
};

export function FeatureCard({ title, description, meta, delay }: FeatureCardProps) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="motion-card flex h-full min-h-56 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/60 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]">
        <div>
          {meta && <p className="text-xs font-black tracking-[0.1em] text-blood">{meta}</p>}
          <h3 className="mt-4 text-xl font-black leading-tight text-white">{title}</h3>
          <p className="mt-4 text-sm font-medium leading-6 text-zinc-300">{description}</p>
        </div>
      </article>
    </Reveal>
  );
}

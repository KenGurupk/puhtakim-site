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
      <article className="flex h-full flex-col justify-between rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-glow">
        <div>
          {meta && <p className="text-xs font-bold uppercase tracking-[0.24em] text-blood">{meta}</p>}
          <h3 className="mt-3 text-xl font-black text-white">{title}</h3>
          <p className="mt-4 text-sm leading-6 text-zinc-300">{description}</p>
        </div>
      </article>
    </Reveal>
  );
}

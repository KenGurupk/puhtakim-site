import { Reveal } from "@/components/motion/reveal";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-16 sm:px-8 sm:pt-24">
      <Reveal>
        <p className="text-sm font-bold uppercase tracking-[0.32em] text-lagoon">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
          {description}
        </p>
      </Reveal>
    </section>
  );
}

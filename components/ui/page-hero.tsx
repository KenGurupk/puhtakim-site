import { Reveal } from "@/components/motion/reveal";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="mx-auto min-w-0 max-w-7xl px-5 pb-14 pt-16 sm:px-8 sm:pb-16 sm:pt-24">
      <Reveal>
        <p className="break-words text-sm font-black tracking-[0.12em] text-blood">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl whitespace-pre-line break-words text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl whitespace-pre-line break-words text-base font-medium leading-8 text-zinc-300 sm:text-lg">
          {description}
        </p>
      </Reveal>
    </section>
  );
}

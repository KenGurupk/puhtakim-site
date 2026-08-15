import type { PropsWithChildren } from "react";

import { Reveal } from "@/components/motion/reveal";

type SectionProps = PropsWithChildren<{
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}>;

export function Section({ id, eyebrow, title, description, children, className = "" }: SectionProps) {
  return (
    <section id={id} className={`mx-auto min-w-0 max-w-7xl px-5 py-16 sm:px-8 sm:py-24 ${className}`}>
      <Reveal>
        {(eyebrow || title || description) && (
          <div className="mb-12 min-w-0 max-w-3xl">
            {eyebrow && (
              <p className="break-words text-sm font-black tracking-[0.12em] text-blood">{eyebrow}</p>
            )}
            {title && <h2 className="mt-5 whitespace-pre-line break-words text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">{title}</h2>}
            {description && <p className="mt-6 whitespace-pre-line break-words text-base font-medium leading-8 text-zinc-300">{description}</p>}
          </div>
        )}
        {children}
      </Reveal>
    </section>
  );
}

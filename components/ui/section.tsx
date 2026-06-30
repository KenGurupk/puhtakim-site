import type { PropsWithChildren } from "react";

type SectionProps = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}>;

export function Section({ eyebrow, title, description, children, className = "" }: SectionProps) {
  return (
    <section className={`mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 ${className}`}>
      {(eyebrow || title || description) && (
        <div className="mb-10 max-w-3xl">
          {eyebrow && (
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-ember">{eyebrow}</p>
          )}
          {title && <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h2>}
          {description && <p className="mt-5 text-base leading-7 text-zinc-300">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

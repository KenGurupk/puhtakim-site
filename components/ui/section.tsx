import type { PropsWithChildren } from "react";

type SectionProps = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}>;

export function Section({ eyebrow, title, description, children, className = "" }: SectionProps) {
  return (
    <section className={`mx-auto min-w-0 max-w-7xl px-5 py-16 sm:px-8 sm:py-24 ${className}`}>
      {(eyebrow || title || description) && (
        <div className="mb-12 min-w-0 max-w-3xl">
          {eyebrow && (
            <p className="break-words text-sm font-black tracking-[0.12em] text-blood">{eyebrow}</p>
          )}
          {title && <h2 className="mt-5 break-words text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">{title}</h2>}
          {description && <p className="mt-6 break-words text-base font-medium leading-8 text-zinc-300">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

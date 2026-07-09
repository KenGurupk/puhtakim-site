"use client";

import { useEffect, useRef, useState } from "react";

type CountUpStatProps = {
  label: string;
  value?: number;
  suffix?: string;
  textValue?: string;
  delay?: number;
};

export function CountUpStat({ label, value, suffix = "", textValue, delay = 0 }: CountUpStatProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [displayValue, setDisplayValue] = useState(value ? 0 : null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || value == null || hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHasStarted(true);

        const duration = 1100;
        const start = performance.now() + delay;
        let frame = 0;

        const tick = (now: number) => {
          if (now < start) {
            frame = requestAnimationFrame(tick);
            return;
          }

          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(Math.round(value * eased));

          if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        observer.disconnect();

        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.45 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, hasStarted, value]);

  return (
    <div
      ref={ref}
      className="motion-card rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-blood/70 hover:shadow-[0_24px_90px_rgba(193,18,31,0.14)]"
    >
      <p className="text-sm font-black text-blood">{label}</p>
      <p className="mt-4 text-4xl font-black leading-none text-white" dir="ltr">
        {value == null ? textValue : `${displayValue ?? value}${suffix}`}
      </p>
    </div>
  );
}

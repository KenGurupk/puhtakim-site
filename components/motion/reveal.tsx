"use client";

import { useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  variant?: "section" | "card" | "text" | "hero";
}>;
const DEBUG_MOTION = process.env.NODE_ENV === "development";

export function Reveal({ children, className = "", delay = 0, variant = "section" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const isHero = variant === "hero";

  useEffect(() => {
    setMounted(true);
    if (DEBUG_MOTION) console.debug("[PushTakim motion] mounted", variant);
  }, [variant]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    if (!isHero) return undefined;

    const handleHeroReady = () => setHeroReady(true);
    const fallback = window.setTimeout(handleHeroReady, 4200);

    window.addEventListener("pushtakim:hero-ready", handleHeroReady, { once: true });
    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("pushtakim:hero-ready", handleHeroReady);
    };
  }, [isHero, variant]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    if (!isHero || !heroReady) return;
    const timer = window.setTimeout(() => setVisible(true), delay * 1000);
    return () => window.clearTimeout(timer);
  }, [delay, heroReady, isHero]);

  useEffect(() => {
    const node = ref.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!node || isHero || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (DEBUG_MOTION) console.debug("[PushTakim motion] intersection", variant);
        window.setTimeout(() => setVisible(true), delay * 1000);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, isHero, variant]);

  return (
    <div
      ref={ref}
      className={`motion-reveal motion-reveal-${variant} ${mounted ? "motion-ready" : ""} ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

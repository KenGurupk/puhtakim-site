"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  variant?: "section" | "card" | "text" | "hero";
}>;
const DEBUG_MOTION = process.env.NODE_ENV === "development";

export function Reveal({ children, className = "", delay = 0, variant = "section" }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const isHero = variant === "hero";

  useEffect(() => {
    if (DEBUG_MOTION) console.debug("[PushTakim motion] mounted", variant);
    if (reducedMotion) return;
    if (!isHero) return undefined;

    const handleHeroReady = () => setHeroReady(true);
    const fallback = window.setTimeout(handleHeroReady, 4200);

    window.addEventListener("pushtakim:hero-ready", handleHeroReady, { once: true });
    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("pushtakim:hero-ready", handleHeroReady);
    };
  }, [isHero, reducedMotion, variant]);

  useEffect(() => {
    if (reducedMotion) return;
    if (!isHero || !heroReady) return;
    const timer = window.setTimeout(() => setVisible(true), delay * 1000);
    return () => window.clearTimeout(timer);
  }, [delay, heroReady, isHero, reducedMotion]);

  useEffect(() => {
    const node = ref.current;
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
  }, [delay, isHero, reducedMotion, variant]);

  return (
    <motion.div
      ref={ref}
      className={`motion-reveal motion-reveal-${variant} ${visible || reducedMotion ? "is-visible" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { useEffect } from "react";

export function HomepageMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".home-motion-root");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(".home-section-motion, .home-card-motion"));

    if (reducedMotion) {
      targets.forEach((target) => target.classList.add("is-visible"));
      root.classList.add("home-hero-start");
      return;
    }

    root.classList.add("home-motion-js");

    const grids = Array.from(root.querySelectorAll<HTMLElement>(".home-card-grid"));
    grids.forEach((grid) => {
      Array.from(grid.querySelectorAll<HTMLElement>(".home-card-motion")).forEach((card, index) => {
        card.style.setProperty("--home-stagger", `${index * 150}ms`);
      });
    });

    let heroStartTimer: number | undefined;
    const startHero = () => {
      if (root.classList.contains("home-hero-start")) return;
      heroStartTimer = window.setTimeout(() => root.classList.add("home-hero-start"), 760);
    };
    const heroFallback = window.setTimeout(startHero, 8600);
    window.addEventListener("pushtakim:hero-visible", startHero, { once: true });

    const revealIfNearby = (target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.12 && rect.bottom > -window.innerHeight * 0.12) {
        target.classList.add("is-visible");
        return true;
      }
      return false;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    );

    targets.forEach((target) => {
      if (!revealIfNearby(target)) observer.observe(target);
    });

    const initialReveal = window.setTimeout(() => {
      targets.forEach((target) => {
        if (target.classList.contains("is-visible")) return;
        if (revealIfNearby(target)) observer.unobserve(target);
      });
    }, 120);

    return () => {
      window.clearTimeout(heroFallback);
      if (heroStartTimer) window.clearTimeout(heroStartTimer);
      window.clearTimeout(initialReveal);
      window.removeEventListener("pushtakim:hero-visible", startHero);
      observer.disconnect();
    };
  }, []);

  return null;
}

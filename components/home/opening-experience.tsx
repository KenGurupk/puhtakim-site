"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { TraceurLoader } from "@/components/brand/traceur-loader";
import { siteCopy } from "@/content/site-copy";

const fragments = siteCopy.openingExperience.fragments;

export function OpeningExperience() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadySeen = window.sessionStorage.getItem("pushtakim-opening-seen");

    if (alreadySeen) {
      return;
    }

    setVisible(true);
    window.sessionStorage.setItem("pushtakim-opening-seen", "true");

    const timer = window.setTimeout(() => setVisible(false), 9000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[80] overflow-hidden bg-black text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(193,18,31,0.16),transparent_34rem)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(#fff_1px,transparent_1px)] [background-size:70px_70px]" />

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="absolute left-5 top-5 z-10 border border-white/20 px-4 py-2 text-xs font-black text-white/70 transition hover:border-blood hover:text-white"
          >
            {siteCopy.openingExperience.skip}
          </button>

          <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-5 py-8 sm:px-8">
            <div className="flex items-center justify-between">
              <TraceurLoader />
              <p className="max-w-32 text-left text-xs font-black uppercase tracking-[0.34em] text-white/35" dir="ltr">
                PushTakim
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-5">
              {fragments.map((fragment, index) => (
                <motion.div
                  key={fragment}
                  className="h-28 overflow-hidden border border-white/10 bg-white/[0.035] sm:h-44"
                  initial={{ opacity: 0, y: 32, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.34, duration: 0.7, ease: "easeOut" }}
                >
                  <div className="relative h-full">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(193,18,31,0.34),transparent_38%),radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.16),transparent_10rem)]" />
                    <div className="absolute bottom-4 right-4 text-lg font-black text-white sm:text-2xl">
                      {fragment}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pb-6">
              <motion.div
                className="max-w-5xl space-y-4 text-4xl font-black leading-tight sm:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.3, duration: 0.85, ease: "easeOut" }}
              >
                <p>{siteCopy.openingExperience.lines[0]}</p>
                <p>{siteCopy.openingExperience.lines[1]}</p>
                <p className="text-blood">{siteCopy.openingExperience.lines[2]}</p>
              </motion.div>

              <motion.div
                className="mt-10 flex flex-wrap items-end gap-5"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 6.1, duration: 0.8, ease: "easeOut" }}
              >
                <div>
                  <p className="text-5xl font-black tracking-tight sm:text-8xl" dir="ltr">
                    PushTakim
                  </p>
                  <p className="mt-3 text-xl font-black text-white/85 sm:text-3xl">
                    {siteCopy.openingExperience.tagline}
                  </p>
                </div>
                <Link
                  href="/events"
                  onClick={() => setVisible(false)}
                  className="bg-blood px-6 py-4 text-base font-black text-white transition hover:bg-white hover:text-black"
                >
                  {siteCopy.openingExperience.cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

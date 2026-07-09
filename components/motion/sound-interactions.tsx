"use client";

import { useEffect } from "react";

import { useSoundCue } from "@/lib/use-sound-cue";

export function SoundInteractions() {
  const playButtonCue = useSoundCue("button");
  const playMenuCue = useSoundCue("menu");

  useEffect(() => {
    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".motion-button")) playButtonCue();
      if (target.closest(".motion-link")) playMenuCue();
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".motion-button, button, a")) playButtonCue();
    };

    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("click", handleClick, { passive: true });

    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("click", handleClick);
    };
  }, [playButtonCue, playMenuCue]);

  return null;
}

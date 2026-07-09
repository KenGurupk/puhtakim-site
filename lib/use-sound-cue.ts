"use client";

import { useCallback } from "react";

import { soundConfig, type SoundCue } from "@/lib/sound-config";

export function useSoundCue(cue: SoundCue) {
  return useCallback(() => {
    const config = soundConfig.cues[cue];

    if (!soundConfig.enabled || !config.enabled || !config.src) {
      return;
    }

    const audio = new Audio(config.src);
    audio.volume = config.volume;
    audio.play().catch(() => undefined);
  }, [cue]);
}

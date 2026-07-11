"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "pushtakim-sound-enabled";
const SOUND_EVENT = "pushtakim:sound-change";
const SOUND_FILES = {
  click: "/sounds/click.wav",
  whoosh: "/sounds/whoosh.wav"
};
const DEBUG_SOUND = process.env.NODE_ENV === "development";
const SOUND_COOLDOWN_MS = 150;

export function SoundInteractions() {
  const [enabled, setEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRefs = useRef<Partial<Record<keyof typeof SOUND_FILES, HTMLAudioElement>>>({});
  const lastSoundAtRef = useRef(0);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => undefined);
    }

    return audioContextRef.current;
  }, []);

  const playTone = useCallback((type: "click" | "whoosh", force = false) => {
    if (!force && !enabled) return;

    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const settings = {
      click: { frequency: 220, endFrequency: 120, volume: 0.035, duration: 0.06 },
      whoosh: { frequency: 90, endFrequency: 170, volume: 0.026, duration: 0.16 }
    }[type];

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(settings.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(settings.endFrequency, now + settings.duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(settings.volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + settings.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + settings.duration + 0.02);
  }, [enabled, getAudioContext]);

  const playSound = useCallback((type: "click" | "whoosh", force = false) => {
    if (!force && !enabled) return;

    const now = Date.now();
    if (!force && now - lastSoundAtRef.current < SOUND_COOLDOWN_MS) return;
    lastSoundAtRef.current = now;

    playTone(type, force);

    const audio = audioRefs.current[type];
    if (!audio) {
      if (DEBUG_SOUND) console.debug("[PushTakim sound] missing audio element", type);
      return;
    }

    if (DEBUG_SOUND) console.debug("[PushTakim sound] play attempt", type);
    if (!audio.paused && !audio.ended) return;
    audio.currentTime = 0;
    audio.play().catch((error) => {
      if (DEBUG_SOUND) console.debug("[PushTakim sound] file play failed, tone already fired", type, error);
    });
  }, [enabled, playTone]);

  useEffect(() => {
    setEnabled(false);
    window.localStorage.setItem(STORAGE_KEY, "false");
    audioRefs.current = {
      click: new Audio(SOUND_FILES.click),
      whoosh: new Audio(SOUND_FILES.whoosh)
    };
    Object.values(audioRefs.current).forEach((audio) => {
      audio.preload = "auto";
      audio.volume = 0.38;
    });
  }, []);

  useEffect(() => {
    if (DEBUG_SOUND) console.debug("[PushTakim sound] state", enabled ? "enabled" : "muted");
  }, [enabled]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!enabled) return;
      const target = event.target as Element | null;
      if (target?.closest("[data-sound-toggle]")) return;
      const button = target?.closest(".motion-button, button, a");
      const card = target?.closest(".motion-card");
      if (button) {
        playSound("click");
        return;
      }
      if (card) {
        playSound("click");
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [enabled, playSound]);

  const toggleSound = () => {
    const next = !enabled;
    if (DEBUG_SOUND) console.debug("[PushTakim sound] toggle click", next ? "enable" : "mute");

    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Sound is optional; blocked storage should not break the UI.
    }

    setEnabled(next);
    window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: { enabled: next } }));

    if (next) {
      window.setTimeout(() => playSound("click", true), 0);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSound}
      className={`motion-button fixed bottom-4 right-4 z-50 inline-flex h-12 min-w-12 items-center justify-center rounded-full border text-white shadow-[0_16px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl transition duration-300 hover:border-blood/70 hover:bg-blood/18 focus:outline-none focus:ring-2 focus:ring-blood/70 focus:ring-offset-2 focus:ring-offset-black ${
        enabled ? "border-blood/70 bg-blood/20 ring-1 ring-blood/55" : "border-white/15 bg-black/82"
      }`}
      aria-label={enabled ? "Sound on" : "Sound off"}
      aria-pressed={enabled}
      title={enabled ? "Sound on" : "Sound off"}
      data-audio-ready="true"
      data-audio-enabled={enabled}
      data-sound-toggle="true"
      data-sound-click={SOUND_FILES.click}
      data-sound-whoosh={SOUND_FILES.whoosh}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M4 9v6h4l5 4V5L8 9H4Z" />
        {enabled ? (
          <>
            <path d="M16 8.5a5 5 0 0 1 0 7" />
            <path d="M19 6a9 9 0 0 1 0 12" />
          </>
        ) : (
          <>
            <path d="M17 9l4 4" />
            <path d="M21 9l-4 4" />
          </>
        )}
      </svg>
    </button>
  );
}

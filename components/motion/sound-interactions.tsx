"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioKit = {
  context: AudioContext;
  ambient: {
    gain: GainNode;
    oscillators: OscillatorNode[];
  };
};

const STORAGE_KEY = "pushtakim-sound-enabled";

function createAudioKit() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextClass();
  const ambientGain = context.createGain();
  ambientGain.gain.value = 0.018;
  ambientGain.connect(context.destination);

  const oscillators = [74, 111].map((frequency, index) => {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();

    oscillator.type = index === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    filter.type = "lowpass";
    filter.frequency.value = 260;

    oscillator.connect(filter);
    filter.connect(ambientGain);
    oscillator.start();

    return oscillator;
  });

  return {
    context,
    ambient: {
      gain: ambientGain,
      oscillators
    }
  };
}

function playTone(context: AudioContext, frequency: number, duration: number, volume: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + duration);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export function SoundInteractions() {
  const audioKit = useRef<AudioKit | null>(null);
  const lastHover = useRef(0);
  const [enabled, setEnabled] = useState(false);

  const ensureAudio = useCallback(async () => {
    if (!audioKit.current) {
      audioKit.current = createAudioKit();
    }

    if (audioKit.current.context.state === "suspended") {
      await audioKit.current.context.resume();
    }

    return audioKit.current.context;
  }, []);

  const playCue = useCallback(
    async (type: "hover" | "click") => {
      if (!enabled) return;

      try {
        const context = await ensureAudio();
        playTone(context, type === "click" ? 220 : 330, type === "click" ? 0.075 : 0.045, type === "click" ? 0.028 : 0.014);
      } catch {
        return;
      }
    },
    [enabled, ensureAudio]
  );

  const toggleSound = async () => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    window.localStorage.setItem(STORAGE_KEY, String(nextEnabled));

    if (nextEnabled) {
      try {
        const context = await ensureAudio();
        playTone(context, 196, 0.12, 0.032);
      } catch {
        return;
      }
    } else if (audioKit.current) {
      audioKit.current.context.suspend().catch(() => undefined);
    }
  };

  useEffect(() => {
    setEnabled(window.localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (!enabled) return;

    ensureAudio().catch(() => undefined);
  }, [enabled, ensureAudio]);

  useEffect(() => {
    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(".motion-button, .motion-link")) return;

      const now = performance.now();
      if (now - lastHover.current < 180) return;
      lastHover.current = now;
      playCue("hover");
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".motion-button, button, a")) playCue("click");
    };

    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("click", handleClick, { passive: true });

    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("click", handleClick);
    };
  }, [playCue]);

  useEffect(() => {
    return () => {
      audioKit.current?.ambient.oscillators.forEach((oscillator) => oscillator.stop());
      audioKit.current?.context.close().catch(() => undefined);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={toggleSound}
      className="motion-button fixed bottom-4 left-4 z-50 inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/78 text-lg text-white shadow-[0_16px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl transition duration-300 hover:border-blood/70 hover:bg-blood/18 focus:outline-none focus:ring-2 focus:ring-blood/70 focus:ring-offset-2 focus:ring-offset-black"
      aria-label={enabled ? "כיבוי סאונד" : "הפעלת סאונד"}
      aria-pressed={enabled}
      title={enabled ? "כיבוי סאונד" : "הפעלת סאונד"}
    >
      <span aria-hidden="true">{enabled ? "🔊" : "🔇"}</span>
    </button>
  );
}

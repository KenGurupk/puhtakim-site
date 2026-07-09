export type SoundCue = "introSticker" | "introTransition" | "menu" | "button";

type SoundCueConfig = {
  enabled: boolean;
  src: string;
  volume: number;
};

export const soundConfig = {
  enabled: false,
  cues: {
    introSticker: { enabled: false, src: "", volume: 0.18 },
    introTransition: { enabled: false, src: "", volume: 0.14 },
    menu: { enabled: false, src: "", volume: 0.08 },
    button: { enabled: false, src: "", volume: 0.06 }
  } satisfies Record<SoundCue, SoundCueConfig>
} as const;

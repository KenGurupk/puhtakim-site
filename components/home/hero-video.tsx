"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type HeroVideoProps = {
  src: string;
  introSrc?: string;
  introAudioSrc?: string;
  enableIntroAudio?: boolean;
  posterSrc?: string;
};

export function HeroVideo({
  src,
  introSrc = "/videos/intro-web.mp4",
  introAudioSrc,
  enableIntroAudio = false,
  posterSrc = "/images/hero.jpg"
}: HeroVideoProps) {
  const [videoReady, setVideoReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introMounted, setIntroMounted] = useState(true);
  const [introUnavailable, setIntroUnavailable] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [heroMotionReady, setHeroMotionReady] = useState(false);
  const introRef = useRef<HTMLVideoElement>(null);
  const introAudioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introFinishedRef = useRef(false);
  const introHidden = introComplete || introUnavailable;

  const announceHeroReady = useCallback(() => {
    setHeroMotionReady(true);
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("pushtakim:hero-ready"));
    }, 250);
  }, []);

  const finishIntro = useCallback(() => {
    if (introFinishedRef.current) {
      return;
    }

    introFinishedRef.current = true;
    setIntroComplete(true);
    announceHeroReady();
    window.setTimeout(() => setIntroMounted(false), 920);
  }, [announceHeroReady]);

  useEffect(() => {
    setSoundEnabled(window.localStorage.getItem("pushtakim-sound-enabled") === "true");

    const handleSoundChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ enabled?: boolean }>;
      setSoundEnabled(Boolean(customEvent.detail?.enabled));
    };

    window.addEventListener("pushtakim:sound-change", handleSoundChange);
    return () => window.removeEventListener("pushtakim:sound-change", handleSoundChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const markReady = () => setVideoReady(true);
    let fallback: number | undefined;

    if (video.readyState >= 2) {
      markReady();
    } else {
      video.addEventListener("loadeddata", markReady, { once: true });
      video.addEventListener("canplay", markReady, { once: true });

      fallback = window.setTimeout(() => {
        if (video.readyState >= 2 || video.currentTime > 0) {
          markReady();
        }
      }, 1200);
    }

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      if (fallback) {
        window.clearTimeout(fallback);
      }
    };
  }, []);

  useEffect(() => {
    const intro = introRef.current;
    const audio = introAudioRef.current;

    if (enableIntroAudio && soundEnabled && audio) {
      audio.volume = 0.22;
      audio.play().catch(() => undefined);
    }

    const introLoadFallback = window.setTimeout(() => {
      if (!intro || (intro.readyState < 2 && intro.currentTime === 0)) {
        setIntroUnavailable(true);
        setIntroMounted(false);
        announceHeroReady();
      }
    }, 1400);

    const introEndFallback = window.setTimeout(() => {
      if (!introFinishedRef.current) {
        finishIntro();
      }
    }, 6500);

    const heroMotionFallback = window.setTimeout(() => {
      if (!heroMotionReady) {
        announceHeroReady();
      }
    }, 4200);

    return () => {
      window.clearTimeout(introLoadFallback);
      window.clearTimeout(introEndFallback);
      window.clearTimeout(heroMotionFallback);
    };
  }, [announceHeroReady, enableIntroAudio, finishIntro, heroMotionReady, soundEnabled]);

  return (
    <>
      {introMounted && (
        <div
          className={`pointer-events-none absolute inset-0 z-30 bg-black transition-opacity duration-1000 ease-out ${introHidden ? "opacity-0" : "opacity-100"}`}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(193,18,31,0.22),transparent_30rem)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-black/70 to-black" />
          {!introUnavailable && (
            <video
              ref={introRef}
              className="absolute inset-0 h-full w-full bg-black object-cover object-center"
              autoPlay
              muted={!soundEnabled}
              playsInline
              preload="auto"
              onEnded={finishIntro}
              onError={() => {
                setIntroUnavailable(true);
                setIntroMounted(false);
                announceHeroReady();
              }}
              onAbort={() => {
                setIntroUnavailable(true);
                setIntroMounted(false);
                announceHeroReady();
              }}
            >
              <source src={introSrc} type="video/mp4" />
            </video>
          )}
          {introAudioSrc && (
            <audio ref={introAudioRef} muted={!enableIntroAudio} preload="none" aria-hidden="true">
              <source src={introAudioSrc} />
            </audio>
          )}
        </div>
      )}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${posterSrc})` }}
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        className={`${introHidden || heroMotionReady ? "hero-background-drift" : ""} absolute inset-0 h-full w-full bg-black object-cover object-center transition-opacity duration-1000 ease-out ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        onLoadedData={() => setVideoReady(true)}
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>
    </>
  );
}

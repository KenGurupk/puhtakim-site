"use client";

import Image from "next/image";
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
  const [introVideoReady, setIntroVideoReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introMounted, setIntroMounted] = useState(true);
  const [introUnavailable, setIntroUnavailable] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [heroMotionReady, setHeroMotionReady] = useState(false);
  const [manualPlayVisible, setManualPlayVisible] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const introRef = useRef<HTMLVideoElement>(null);
  const introAudioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introFinishedRef = useRef(false);
  const lastHeroPlayAttemptRef = useRef(0);
  const playFailureLoggedRef = useRef(false);
  const introHidden = introComplete;

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
    window.setTimeout(() => {
      setIntroMounted(false);
      window.dispatchEvent(new CustomEvent("pushtakim:hero-visible"));
    }, 920);
  }, [announceHeroReady]);

  const prepareHeroVideo = useCallback((video: HTMLVideoElement) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    video.loop = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.removeAttribute("controls");
  }, []);

  const notePlaybackFailure = useCallback(() => {
    if (!playFailureLoggedRef.current) {
      playFailureLoggedRef.current = true;
      console.warn("PushTakim hero video playback was blocked or failed.");
    }

    setPlaybackFailed(true);
    setManualPlayVisible(true);
  }, []);

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

    prepareHeroVideo(video);

    const markReady = () => {
      if (!video.paused && !video.ended) {
        setManualPlayVisible(false);
        setPlaybackFailed(false);
        setVideoReady(true);
      }
    };

    const tryPlay = (fromUserGesture = false) => {
      const now = Date.now();

      if (document.hidden || !video.paused || (!fromUserGesture && now - lastHeroPlayAttemptRef.current < 900)) {
        return;
      }

      lastHeroPlayAttemptRef.current = now;
      prepareHeroVideo(video);
      const playPromise = video.play();

      if (playPromise) {
        playPromise
          .then(() => {
            setManualPlayVisible(false);
            setPlaybackFailed(false);
            setVideoReady(true);
          })
          .catch(() => {
            if (introFinishedRef.current || introComplete || heroMotionReady) {
              notePlaybackFailure();
            }
          });
      }
    };

    const handleCanPlay = () => {
      tryPlay();
      markReady();
    };

    const handlePause = () => {
      if (!document.hidden) {
        tryPlay();

        if (introFinishedRef.current || introComplete || heroMotionReady) {
          setManualPlayVisible(true);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        tryPlay();
      }
    };

    const handleWindowResume = () => {
      tryPlay();
    };

    video.addEventListener("loadedmetadata", handleCanPlay);
    video.addEventListener("loadeddata", handleCanPlay);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", markReady);
    video.addEventListener("pause", handlePause);
    window.addEventListener("focus", handleWindowResume);
    window.addEventListener("pageshow", handleWindowResume);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const fallback = window.setTimeout(() => {
      handleCanPlay();
    }, 900);

    return () => {
      video.removeEventListener("loadedmetadata", handleCanPlay);
      video.removeEventListener("loadeddata", handleCanPlay);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", markReady);
      video.removeEventListener("pause", handlePause);
      window.removeEventListener("focus", handleWindowResume);
      window.removeEventListener("pageshow", handleWindowResume);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearTimeout(fallback);
    };
  }, [heroMotionReady, introComplete, notePlaybackFailure, prepareHeroVideo]);

  useEffect(() => {
    const intro = introRef.current;
    const audio = introAudioRef.current;

    if (enableIntroAudio && soundEnabled && audio) {
      audio.volume = 0.22;
      audio.play().catch(() => undefined);
    }

    if (intro?.readyState && intro.readyState >= 2) {
      setIntroVideoReady(true);
    }

    const introLoadFallback = window.setTimeout(() => {
      if (!intro || (intro.readyState < 2 && intro.currentTime === 0)) {
        setIntroUnavailable(true);
      }
    }, 5200);

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

    const manualPlayFallback = window.setTimeout(() => {
      const heroVideo = videoRef.current;

      if (heroVideo && heroVideo.paused && !videoReady) {
        setManualPlayVisible(true);
      }
    }, 7600);

    return () => {
      window.clearTimeout(introLoadFallback);
      window.clearTimeout(introEndFallback);
      window.clearTimeout(heroMotionFallback);
      window.clearTimeout(manualPlayFallback);
    };
  }, [announceHeroReady, enableIntroAudio, finishIntro, heroMotionReady, soundEnabled, videoReady]);

  const playHeroFromButton = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    prepareHeroVideo(video);
    const playPromise = video.play();

    if (playPromise) {
      playPromise
        .then(() => {
          setManualPlayVisible(false);
          setPlaybackFailed(false);
          setVideoReady(true);
        })
        .catch(notePlaybackFailure);
    }
  };

  const showManualPlayButton = introHidden && (manualPlayVisible || !videoReady);

  return (
    <>
      {introMounted && (
        <div
          className={`pointer-events-none absolute inset-0 z-30 bg-black transition-opacity duration-1000 ease-out ${introHidden ? "opacity-0" : "opacity-100"}`}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(193,18,31,0.22),transparent_30rem)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-black/70 to-black" />
          <div
            className={`intro-sticker-loader absolute inset-0 grid place-items-center transition-opacity duration-700 ease-out ${introVideoReady && !introUnavailable ? "opacity-0" : "opacity-100"}`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(193,18,31,0.18),transparent_22rem)]" />
            <Image
              src="/drive-assets/logo/logo-sticker.png"
              alt=""
              width={2560}
              height={1440}
              className="intro-sticker-mark relative h-auto w-48 max-w-[58vw] drop-shadow-[0_28px_80px_rgba(193,18,31,0.36)] sm:w-64"
              decoding="async"
              priority
            />
          </div>
          {!introUnavailable && (
            <video
              ref={introRef}
              className={`absolute inset-0 h-full w-full bg-black object-cover object-center transition-opacity duration-700 ease-out ${introVideoReady ? "opacity-100" : "opacity-0"}`}
              autoPlay
              muted={!soundEnabled}
              playsInline
              preload="auto"
              onLoadedData={() => setIntroVideoReady(true)}
              onCanPlay={() => setIntroVideoReady(true)}
              onEnded={finishIntro}
              onError={() => {
                setIntroUnavailable(true);
                finishIntro();
              }}
              onAbort={() => {
                setIntroUnavailable(true);
                finishIntro();
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
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${posterSrc})` }}
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        className={`pointer-events-none ${introHidden || heroMotionReady ? "hero-background-drift" : ""} absolute inset-0 h-full w-full bg-black object-cover object-center transition-opacity duration-1000 ease-out ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onPlaying={() => setVideoReady(true)}
        controls={false}
        disableRemotePlayback
        onError={() => {
          setPlaybackFailed(true);
          setManualPlayVisible(true);
        }}
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>
      {showManualPlayButton && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center px-5 pb-28 sm:items-center sm:pb-0">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={playHeroFromButton}
              className="pointer-events-auto inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/25 bg-black/70 px-5 py-3 text-sm font-black text-white shadow-[0_18px_70px_rgba(193,18,31,0.28)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-blood hover:bg-blood focus:outline-none focus:ring-2 focus:ring-blood focus:ring-offset-2 focus:ring-offset-black active:scale-[0.98]"
            >
              הפעל סרטון
            </button>
            {playbackFailed && (
              <p className="pointer-events-none mt-3 max-w-xs text-center text-xs font-bold leading-5 text-white/72">
                הסרטון לא הצליח להיטען כרגע. אפשר להמשיך לגלול באתר.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

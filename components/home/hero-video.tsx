"use client";

import { useEffect, useRef, useState } from "react";

type HeroVideoProps = {
  src: string;
};

export function HeroVideo({ src }: HeroVideoProps) {
  const [videoReady, setVideoReady] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [introUnavailable, setIntroUnavailable] = useState(false);
  const introRef = useRef<HTMLVideoElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ready = videoReady && (introComplete || introUnavailable);

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
    const introFallback = window.setTimeout(() => {
      if (!intro || (intro.readyState < 2 && intro.currentTime === 0)) {
        setIntroUnavailable(true);
      }
    }, 1400);

    return () => window.clearTimeout(introFallback);
  }, []);

  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 z-30 bg-black transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(193,18,31,0.22),transparent_30rem)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-black/70 to-black" />
        {!introUnavailable && (
          <video
            ref={introRef}
            className="absolute inset-0 h-full w-full bg-black object-contain object-center"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => setIntroComplete(true)}
            onError={() => setIntroUnavailable(true)}
            onAbort={() => setIntroUnavailable(true)}
          >
            <source src="/videos/intro-web.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full bg-black object-contain object-center transition-opacity duration-1000 ${
          ready ? "opacity-100" : "opacity-0"
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

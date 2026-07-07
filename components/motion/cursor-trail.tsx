"use client";

import { useEffect, useRef, useState } from "react";

const TRAIL_COUNT = 7;

export function CursorTrail() {
  const nodes = useRef<Array<HTMLSpanElement | null>>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canHover || reducedMotion) {
      return;
    }

    setEnabled(true);

    let frame = 0;
    let lastMove = 0;
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const points = Array.from({ length: TRAIL_COUNT }, () => ({ ...pointer }));

    const move = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      lastMove = performance.now();
    };

    const draw = () => {
      const now = performance.now();
      const idle = Math.min(1, Math.max(0, (now - lastMove - 70) / 260));

      points.forEach((point, index) => {
        const follow = index === 0 ? pointer : points[index - 1];
        const ease = 0.34 - index * 0.025;
        point.x += (follow.x - point.x) * ease;
        point.y += (follow.y - point.y) * ease;

        const node = nodes.current[index];
        if (!node) {
          return;
        }

        const scale = Math.max(0.12, 1 - index * 0.11);
        const opacity = Math.max(0, (0.18 - index * 0.018) * (1 - idle));
        node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate3d(-50%, -50%, 0) scale(${scale})`;
        node.style.opacity = String(opacity);
      });

      frame = window.requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", move, { passive: true });
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("pointermove", move);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <div className="cursor-airflow" aria-hidden="true">
      {Array.from({ length: TRAIL_COUNT }).map((_, index) => (
        <span
          key={index}
          ref={(node) => {
            nodes.current[index] = node;
          }}
        />
      ))}
    </div>
  );
}

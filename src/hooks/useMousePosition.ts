"use client";

import { useEffect, useState } from "react";

export type MousePosition = {
  x: number;
  y: number;
  px: number;
  py: number;
};

const DEFAULT: MousePosition = { x: 0.5, y: 0.5, px: 0, py: 0 };

export function useMousePosition(enabled = true): MousePosition {
  const [position, setPosition] = useState<MousePosition>(DEFAULT);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    let latest = DEFAULT;

    const flush = () => {
      frame = 0;
      setPosition(latest);
      document.documentElement.style.setProperty("--mouse-x", String(latest.x));
      document.documentElement.style.setProperty("--mouse-y", String(latest.y));
      document.documentElement.style.setProperty("--mouse-px", `${latest.px}px`);
      document.documentElement.style.setProperty("--mouse-py", `${latest.py}px`);
    };

    const onMove = (event: MouseEvent) => {
      latest = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
        px: event.clientX,
        py: event.clientY,
      };
      if (!frame) frame = window.requestAnimationFrame(flush);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return position;
}

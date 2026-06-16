"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useEffect, useState } from "react";

export function FilmGrainOverlay() {
  const reducedMotion = useReducedMotion();
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    setCoarsePointer(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  if (reducedMotion || coarsePointer) return null;

  return (
    <div
      className="film-grain pointer-events-none fixed inset-0 z-[2] opacity-[0.045] mix-blend-overlay dark:mix-blend-soft-light"
      aria-hidden
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="film-grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          >
            <animate
              attributeName="seed"
              dur="1.2s"
              values="0;5;2;8;0"
              repeatCount="indefinite"
            />
          </feTurbulence>
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain-noise)" />
      </svg>
    </div>
  );
}

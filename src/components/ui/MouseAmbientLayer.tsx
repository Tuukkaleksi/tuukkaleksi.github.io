"use client";

import { useMousePosition } from "@/hooks/useMousePosition";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function MouseAmbientLayer() {
  const reducedMotion = useReducedMotion();
  useMousePosition(!reducedMotion);

  if (reducedMotion) return null;

  return (
    <div className="mouse-ambient-layer pointer-events-none fixed inset-0 z-[1]" aria-hidden>
      <div className="mouse-spotlight" />
      <div className="mouse-orb mouse-orb-1" />
      <div className="mouse-orb mouse-orb-2" />
      <div className="mouse-orb mouse-orb-3" />
      <div className="mouse-grid-glow" />
    </div>
  );
}

"use client";

import { useGSAP } from "@gsap/react";
import { type ReactNode, useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/gsap/register";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type GsapRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left";
};

export function GsapReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion) return;

      ensureGsapRegistered();

      const fromX = direction === "left" ? -48 : 0;
      const fromY = direction === "up" ? 40 : 0;

      gsap.fromTo(
        el,
        {
          clipPath: direction === "up" ? "inset(100% 0% 0% 0%)" : "inset(0% 100% 0% 0%)",
          y: fromY,
          x: fromX,
        },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          x: 0,
          duration: 0.85,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [reducedMotion, delay, direction] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

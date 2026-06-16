"use client";

import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";
import { type RefObject, type ReactNode } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/gsap/register";
import { heroScrollProgress } from "@/lib/hero/scrollProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const HeroParticles = dynamic(
  () => import("@/components/hero/HeroParticles").then((m) => m.HeroParticles),
  { ssr: false },
);

type HeroScrollSceneProps = {
  triggerRef: RefObject<HTMLElement | null>;
  children?: ReactNode;
};

export function HeroScrollScene({ triggerRef, children }: HeroScrollSceneProps) {
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const trigger = triggerRef.current;
      if (!trigger || reducedMotion) return;

      ensureGsapRegistered();

      const scene = trigger.querySelector<HTMLElement>("[data-hero-scene]");
      if (!scene) return;

      gsap.fromTo(
        scene,
        { opacity: 0.55, scale: 1.15, rotateZ: -2 },
        {
          opacity: 0.2,
          scale: 1.35,
          rotateZ: 4,
          ease: "none",
          scrollTrigger: {
            trigger,
            start: "top top",
            end: "bottom top",
            scrub: 1,
            onUpdate: (self) => {
              heroScrollProgress.current = self.progress;
            },
          },
        },
      );
    },
    { dependencies: [reducedMotion, triggerRef] },
  );

  return (
    <>
      <div
        data-hero-scene
        className="pointer-events-none absolute inset-[-15%] z-[1] scale-125 opacity-45 backdrop-blur-[1px]"
      >
        {!reducedMotion ? <HeroParticles className="h-full w-full" /> : null}
      </div>
      {children}
    </>
  );
}

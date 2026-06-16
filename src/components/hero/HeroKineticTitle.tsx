"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/gsap/register";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type HeroKineticTitleProps = {
  text: string;
};

export function HeroKineticTitle({ text }: HeroKineticTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reducedMotion = useReducedMotion();
  const words = text.split(" ");

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reducedMotion) return;

      ensureGsapRegistered();

      const chars = root.querySelectorAll<HTMLElement>("[data-hero-char]");
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

      gsap.fromTo(
        chars,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: coarsePointer ? 0.65 : 0.9,
          stagger: coarsePointer ? 0.02 : 0.035,
          ease: "power3.out",
          delay: 0.15,
        },
      );
    },
    { scope: ref, dependencies: [reducedMotion, text] },
  );

  return (
    <h1
      ref={ref}
      className="font-display text-5xl font-bold leading-[0.95] tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl"
    >
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="mr-[0.3em] inline-block whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <span key={`${wordIndex}-${charIndex}`} className="inline-block overflow-hidden align-top">
              <span data-hero-char className="inline-block">
                {char}
              </span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

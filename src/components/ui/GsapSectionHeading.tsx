"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/gsap/register";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type GsapSectionHeadingProps = {
  title: string;
  description?: string;
};

export function GsapSectionHeading({ title, description }: GsapSectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const words = title.split(" ");

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reducedMotion) return;

      ensureGsapRegistered();

      const titleWords = root.querySelectorAll<HTMLElement>("[data-title-word]");
      const line = root.querySelector<HTMLElement>("[data-title-line]");
      const desc = root.querySelector<HTMLElement>("[data-title-desc]");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 85%",
          once: true,
        },
      });

      tl.fromTo(
        titleWords,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.75, stagger: 0.06, ease: "power3.out" },
      );

      if (line) {
        tl.fromTo(line, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.45, ease: "power3.out" }, "-=0.35");
      }

      if (desc) {
        tl.fromTo(
          desc,
          { clipPath: "inset(100% 0% 0% 0%)", y: 16 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.2",
        );
      }
    },
    { scope: ref, dependencies: [reducedMotion, title, description] },
  );

  return (
    <div ref={ref} className="mb-16 text-center lg:mb-20">
      <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="mr-[0.28em] inline-block overflow-hidden align-top">
            <span data-title-word className="inline-block">
              {word}
            </span>
          </span>
        ))}
      </h2>
      <div
        data-title-line
        className="mx-auto mt-3 h-1 w-16 origin-left rounded-full bg-primary"
      />
      {description ? (
        <p
          data-title-desc
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-secondary"
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

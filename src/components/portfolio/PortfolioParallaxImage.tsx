"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";
import { ensureGsapRegistered, gsap } from "@/lib/gsap/register";
import { refreshScrollTriggersDebounced } from "@/lib/gsap/refresh";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type PortfolioParallaxImageProps = {
  src: string;
  alt: string;
};

export function PortfolioParallaxImage({ src, alt }: PortfolioParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const container = containerRef.current;
      const image = imageRef.current;
      if (!container || !image || reducedMotion) return;

      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      if (coarsePointer) return;

      ensureGsapRegistered();

      gsap.fromTo(
        image,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: containerRef, dependencies: [reducedMotion] },
  );

  return (
    <div ref={containerRef} className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
      <div ref={imageRef} className="absolute inset-0 scale-110 will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => refreshScrollTriggersDebounced()}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}

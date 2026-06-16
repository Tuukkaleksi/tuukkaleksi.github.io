"use client";

import { useEffect } from "react";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { FilmGrainOverlay } from "@/components/ui/FilmGrainOverlay";
import { refreshScrollTriggersDebounced } from "@/lib/gsap/refresh";

type HomeExperienceProps = {
  children: React.ReactNode;
};

export function HomeExperience({ children }: HomeExperienceProps) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => refreshScrollTriggersDebounced(0));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <SmoothScrollProvider>
      <FilmGrainOverlay />
      {children}
    </SmoothScrollProvider>
  );
}

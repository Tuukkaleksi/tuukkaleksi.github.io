"use client";

import { motion } from "motion/react";
import { SectionAmbientBackground } from "@/components/ui/SectionAmbientBackground";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeIn, motionTransition } from "@/lib/motion";

export function PortfolioBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <>
      <SectionAmbientBackground />
      <motion.div
        className="portfolio-shimmer pointer-events-none absolute inset-x-0 top-1/3 z-[1] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        aria-hidden
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        transition={motionTransition(reducedMotion, { duration: 1.2, ease: "easeOut" })}
      />
    </>
  );
}

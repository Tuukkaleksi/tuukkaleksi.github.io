"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeUp, motionTransition } from "@/lib/motion";
import { scrollRevealViewport } from "@/components/ui/ScrollReveal";

type AnimatedSectionHeadingProps = {
  title: string;
  description?: string;
};

export function AnimatedSectionHeading({ title, description }: AnimatedSectionHeadingProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="mb-12 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={scrollRevealViewport}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.1 } },
      }}
    >
      <motion.h2
        className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        variants={fadeUp}
        transition={motionTransition(reducedMotion)}
      >
        {title}
      </motion.h2>
      <motion.div
        className="mx-auto mt-3 h-1 rounded-full bg-primary"
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: 64, opacity: 1 }}
        viewport={scrollRevealViewport}
        transition={motionTransition(reducedMotion, { duration: 0.55, ease: "easeOut" })}
      />
      {description ? (
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-secondary"
          variants={fadeUp}
          transition={motionTransition(reducedMotion, { delay: 0.08 })}
        >
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  );
}

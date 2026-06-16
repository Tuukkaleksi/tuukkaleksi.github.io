"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeUp, motionTransition, premiumTween, staggerContainer, staggerItem } from "@/lib/motion";

export const scrollRevealViewport = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -48px 0px",
} as const;

type ScrollRevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  delay?: number;
};

export function ScrollReveal({ children, className, delay = 0, ...props }: ScrollRevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={scrollRevealViewport}
      transition={motionTransition(reducedMotion, { ...premiumTween, delay })}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type ScrollRevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
};

export function ScrollRevealGroup({ children, className, as = "div" }: ScrollRevealGroupProps) {
  const reducedMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      variants={staggerContainer(reducedMotion)}
      initial="hidden"
      whileInView="visible"
      viewport={scrollRevealViewport}
    >
      {children}
    </Component>
  );
}

type ScrollRevealItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
};

export function ScrollRevealItem({ children, className, as = "div" }: ScrollRevealItemProps) {
  const reducedMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component className={className} variants={staggerItem(reducedMotion)}>
      {children}
    </Component>
  );
}

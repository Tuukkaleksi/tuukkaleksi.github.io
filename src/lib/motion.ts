import type { Transition, Variants } from "motion/react";

export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const duration = {
  fast: 0.32,
  normal: 0.42,
} as const;

export const distance = {
  sm: 12,
  md: 20,
} as const;

export const premiumTween: Transition = {
  duration: duration.normal,
  ease: premiumEase,
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
};

export const heroParallaxSpring = {
  stiffness: 120,
  damping: 26,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: distance.sm },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainer = (reducedMotion: boolean): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: reducedMotion ? 0 : 0.06,
      delayChildren: reducedMotion ? 0 : 0.04,
    },
  },
});

export const staggerItem = (reducedMotion: boolean): Variants => ({
  hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: distance.sm },
  visible: {
    opacity: 1,
    y: 0,
    transition: reducedMotion ? { duration: 0 } : premiumTween,
  },
});

export const scaleTap = (reducedMotion: boolean) =>
  reducedMotion
    ? {}
    : {
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
      };

export const slideHorizontal = (
  direction: 1 | -1,
  reducedMotion: boolean,
): Variants => ({
  enter: reducedMotion
    ? { opacity: 1, x: 0 }
    : { opacity: 0, x: direction * distance.sm },
  center: { opacity: 1, x: 0 },
  exit: reducedMotion
    ? { opacity: 1, x: 0 }
    : { opacity: 0, x: direction * -distance.sm },
});

export function motionTransition(
  reducedMotion: boolean,
  transition: Transition = premiumTween,
): Transition {
  return reducedMotion ? { duration: 0 } : transition;
}

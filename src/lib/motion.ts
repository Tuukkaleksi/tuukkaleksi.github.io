import type { Transition, Variants } from "motion/react";

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

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
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
      staggerChildren: reducedMotion ? 0 : 0.1,
      delayChildren: reducedMotion ? 0 : 0.06,
    },
  },
});

export const staggerItem = (reducedMotion: boolean): Variants => ({
  hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reducedMotion ? { duration: 0 } : gentleSpring,
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
    : { opacity: 0, x: direction * 20 },
  center: { opacity: 1, x: 0 },
  exit: reducedMotion
    ? { opacity: 1, x: 0 }
    : { opacity: 0, x: direction * -20 },
});

export function motionTransition(reducedMotion: boolean, transition: Transition = gentleSpring): Transition {
  return reducedMotion ? { duration: 0 } : transition;
}

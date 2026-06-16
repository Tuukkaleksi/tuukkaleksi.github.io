"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { type ReactNode, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

const MAGNETIC_STRENGTH = 12;

export function MagneticButton({
  children,
  className,
  href,
  type = "button",
  disabled,
  onClick,
}: MagneticButtonProps) {
  const reducedMotion = useReducedMotion();
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 180, damping: 18, mass: 0.4 });

  const handleMove = (event: React.MouseEvent, el: HTMLElement | null) => {
    if (reducedMotion || disabled || !el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    x.set((offsetX / rect.width) * MAGNETIC_STRENGTH);
    y.set((offsetY / rect.height) * MAGNETIC_STRENGTH);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const style = reducedMotion ? undefined : { x: springX, y: springY };

  if (href) {
    return (
      <motion.a
        ref={anchorRef}
        href={href}
        className={className}
        style={style}
        onMouseMove={(event) => handleMove(event, anchorRef.current)}
        onMouseLeave={handleLeave}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      className={className}
      style={style}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={(event) => handleMove(event, buttonRef.current)}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.button>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { motion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HeroKineticTitle } from "@/components/hero/HeroKineticTitle";
import { HeroScrollScene } from "@/components/hero/HeroScrollScene";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { heroParallaxSpring } from "@/lib/motion";
import { socialLinks } from "@/content/social-links";

export function Hero() {
  const t = useTranslations("hero");
  const tSite = useTranslations("site");
  const roles = tSite.raw("typedRoles") as string[];
  const [roleIndex, setRoleIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const mouse = useMousePosition();
  const heroRef = useRef<HTMLElement>(null);

  const springX = useSpring(0, heroParallaxSpring);
  const springY = useSpring(0, heroParallaxSpring);
  const parallaxX = useTransform(springX, (v) => v * 28);
  const parallaxY = useTransform(springY, (v) => v * 20);

  useEffect(() => {
    if (reducedMotion) return;
    springX.set((mouse.x - 0.5) * 2);
    springY.set((mouse.y - 0.5) * 2);
  }, [mouse.x, mouse.y, reducedMotion, springX, springY]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setVisible(false);
      timeoutId = setTimeout(() => {
        setRoleIndex((i) => (i + 1) % roles.length);
        setVisible(true);
      }, 280);
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [roles.length]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="hero-section relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pt-16 text-white lg:pt-0"
    >
      <HeroScrollScene triggerRef={heroRef} />
      <motion.div
        className="hero-gradient pointer-events-none absolute inset-0 z-[2]"
        aria-hidden
        style={reducedMotion ? undefined : { x: parallaxX, y: parallaxY }}
      />
      {!reducedMotion ? (
        <div className="hero-mouse-glow pointer-events-none absolute inset-0 z-[2]" aria-hidden />
      ) : null}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-32 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
          {t("eyebrow")}
        </p>
        <HeroKineticTitle text={tSite("name")} />
        <p className="mt-6 text-lg text-white/85 sm:text-xl">
          <span
            className={`inline-block min-w-[10ch] font-medium text-sky-300 transition-opacity duration-300 dark:text-sky-400 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {roles[roleIndex]}
          </span>
        </p>
        <SocialLinks
          links={socialLinks}
          className="mt-8 justify-center"
          iconClassName="border-white/20 bg-white/10 text-white hover:bg-primary hover:border-primary"
        />
        <MagneticButton
          href="#about"
          className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white/90 transition hover:border-white hover:bg-white/10"
        >
          {t("cta")}
          <span aria-hidden>↓</span>
        </MagneticButton>
      </div>
    </section>
  );
}

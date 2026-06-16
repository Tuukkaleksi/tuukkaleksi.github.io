"use client";

import Lenis from "lenis";
import { usePathname } from "@/i18n/navigation";
import { ensureGsapRegistered, gsap, ScrollTrigger } from "@/lib/gsap/register";
import { refreshScrollTriggersDebounced } from "@/lib/gsap/refresh";
import { isHomePath } from "@/lib/home/isHomePath";
import { setActiveLenis } from "@/lib/lenis/instance";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useEffect } from "react";

type SmoothScrollProviderProps = {
  children: React.ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const isHome = isHomePath(pathname);

  useEffect(() => {
    if (!isHome || reducedMotion) {
      setActiveLenis(null);
      document.documentElement.classList.remove("lenis");
      document.body.classList.remove("lenis");
      return;
    }

    ensureGsapRegistered();

    const prefersCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (prefersCoarse) {
      setActiveLenis(null);
      return;
    }

    const instance = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
    });

    document.documentElement.classList.add("lenis");
    document.body.classList.add("lenis");
    setActiveLenis(instance);

    instance.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => refreshScrollTriggersDebounced();
    const onLoad = () => refreshScrollTriggersDebounced();
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onLoad);

    refreshScrollTriggersDebounced(0);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(ticker);
      instance.destroy();
      setActiveLenis(null);
      document.documentElement.classList.remove("lenis");
      document.body.classList.remove("lenis");
    };
  }, [isHome, reducedMotion]);

  return children;
}

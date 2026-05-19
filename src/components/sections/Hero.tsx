"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { socialLinks } from "@/content/social-links";

export function Hero() {
  const t = useTranslations("hero");
  const tSite = useTranslations("site");
  const roles = tSite.raw("typedRoles") as string[];
  const [roleIndex, setRoleIndex] = useState(0);
  const [visible, setVisible] = useState(true);

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
      id="hero"
      className="hero-section relative flex min-h-[100svh] items-center justify-center px-4 pt-16 text-white lg:pt-0"
    >
      <div className="hero-gradient pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {tSite("name")}
        </h1>
        <p className="mt-4 text-lg text-white/85 sm:text-xl">
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
        <a
          href="#about"
          className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white/90 transition hover:border-white hover:bg-white/10"
        >
          {t("cta")}
          <span aria-hidden>↓</span>
        </a>
      </div>
    </section>
  );
}

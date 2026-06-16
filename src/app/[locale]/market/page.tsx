"use client";

import { MonitorSmartphone, Zap, ChevronRight, Rocket, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Link } from "@/i18n/navigation";

interface Dynamic3DCubeProps {
  size?: number;
  positionClasses: string;
  floatDelay?: string;
  spinDuration?: string;
  reverse?: boolean;
  opacity?: string;
}

const Dynamic3DCube = ({
  size = 200,
  positionClasses,
  floatDelay = "0s",
  spinDuration = "20s",
  reverse = false,
  opacity = "opacity-30 lg:opacity-50",
}: Dynamic3DCubeProps) => {
  const halfSize = size / 2;
  const spinDirection = reverse ? "reverse" : "normal";

  const faces = [
    { transform: `rotateY(0deg) translateZ(${halfSize}px)` },
    { transform: `rotateY(180deg) translateZ(${halfSize}px)` },
    { transform: `rotateY(90deg) translateZ(${halfSize}px)` },
    { transform: `rotateY(-90deg) translateZ(${halfSize}px)` },
    { transform: `rotateX(90deg) translateZ(${halfSize}px)` },
    { transform: `rotateX(-90deg) translateZ(${halfSize}px)` },
  ];

  return (
    <div
      className={`market-3d-decor absolute ${positionClasses} ${opacity} pointer-events-none z-0`}
      style={{ width: size, height: size, perspective: "1200px" }}
    >
      <div className="market-animate-float-slow h-full w-full" style={{ animationDelay: floatDelay }}>
        <div
          className="market-preserve-3d relative h-full w-full"
          style={{ animation: `market-spin-3d ${spinDuration} linear infinite ${spinDirection}` }}
        >
          {faces.map((face, i) => (
            <div
              key={i}
              className="absolute left-0 top-0 flex h-full w-full items-center justify-center border border-slate-400/20 bg-gradient-to-br from-slate-200/10 to-slate-400/10 backdrop-blur-[2px] dark:border-white/10 dark:from-white/5 dark:to-white/10"
              style={{ transform: face.transform }}
            >
              {i === 0 && (
                <div className="h-8 w-8 rounded-sm border border-slate-400/30 dark:border-white/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function HubtownBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="market-bg-animated">
      <div className="market-animate-ambient absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-blue-200/40 blur-[150px] mix-blend-multiply dark:bg-blue-900/20 dark:mix-blend-screen" />
      <div
        className="market-animate-ambient absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-purple-200/40 blur-[150px] mix-blend-multiply dark:bg-purple-900/20 dark:mix-blend-screen"
        style={{ animationDelay: "-10s" }}
      />

      {!reducedMotion ? (
        <>
          <Dynamic3DCube
            size={280}
            positionClasses="top-[20%] -right-10 lg:right-[10%]"
            spinDuration="30s"
          />
          <Dynamic3DCube
            size={120}
            positionClasses="top-[15%] left-[5%] lg:left-[15%]"
            floatDelay="-4s"
            spinDuration="22s"
            reverse
            opacity="opacity-40"
          />
          <Dynamic3DCube
            size={180}
            positionClasses="bottom-[10%] left-[-5%] lg:left-[5%]"
            floatDelay="-8s"
            spinDuration="28s"
          />
        </>
      ) : null}
    </div>
  );
}

export default function MarketPage() {
  const t = useTranslations("market");

  const brandFeatures = [
    t("services.brand.features.0"),
    t("services.brand.features.1"),
    t("services.brand.features.2"),
  ];
  const saasFeatures = [
    t("services.saas.features.0"),
    t("services.saas.features.1"),
    t("services.saas.features.2"),
  ];
  const templateFeatures = [
    t("services.templates.features.0"),
    t("services.templates.features.1"),
    t("services.templates.features.2"),
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <HubtownBackground />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="relative mb-40 max-w-4xl pt-16 lg:pt-24">
          <ScrollReveal delay={0.05}>
            <div className="mb-8 h-1 w-12 rounded-full bg-blue-600 dark:bg-blue-500" />
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="mb-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <Zap size={16} className="text-blue-600 dark:text-blue-500" />
              <span>{t("hero.eyebrow")}</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <h1 className="mb-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              {t("hero.title")}
              <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-slate-600 to-slate-900 bg-clip-text text-transparent dark:from-slate-200 dark:to-white">
                {t("hero.titleAccent")}
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.16}>
            <p className="mb-12 max-w-2xl text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">
              {t("hero.description")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/#contact"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-slate-900 px-8 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20 dark:bg-white dark:text-black dark:hover:shadow-white/20"
              >
                <span className="relative z-10">{t("hero.ctaPrimary")}</span>
                <ChevronRight
                  size={18}
                  className="relative z-10 transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#services"
                className="inline-flex items-center gap-2 px-6 py-4 font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                {t("hero.ctaSecondary")}
              </a>
            </div>
          </ScrollReveal>
        </div>

        <div id="services" className="mt-32 pt-20">
          <ScrollReveal>
            <div className="mb-16 flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {t("services.title")}
              </h2>
              <div className="mx-8 hidden h-px flex-grow bg-slate-200 dark:bg-white/10 sm:block" />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ScrollReveal delay={0.08}>
              <div className="group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white/40 p-10 backdrop-blur-xl transition-all duration-500 hover:border-blue-500/30 hover:bg-white/80 dark:border-white/5 dark:bg-[#0A0A0F]/60 dark:hover:bg-white/[0.03]">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white dark:bg-white/5 dark:text-white">
                  <MonitorSmartphone size={24} strokeWidth={1.5} />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                  {t("services.brand.title")}
                </h3>
                <p className="mb-10 flex-grow font-light leading-relaxed text-slate-600 dark:text-slate-400">
                  {t("services.brand.description")}
                </p>
                <ul className="mb-10 space-y-4 border-t border-slate-200 pt-8 dark:border-white/5">
                  {brandFeatures.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-4 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
                >
                  {t("services.brand.cta")}{" "}
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.14}>
              <div className="group relative flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-2xl shadow-slate-900/20 transition-all duration-500 hover:border-slate-600 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-blue-600/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="absolute right-0 top-0">
                    <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 dark:bg-slate-700 dark:text-white">
                      {t("services.saas.badge")}
                    </span>
                  </div>
                  <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white transition-all duration-500 group-hover:scale-110 dark:bg-slate-700">
                    <Rocket size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-white">{t("services.saas.title")}</h3>
                  <p className="mb-10 flex-grow font-light leading-relaxed text-slate-400">
                    {t("services.saas.description")}
                  </p>
                  <ul className="mb-10 space-y-4 border-t border-slate-800 pt-8 dark:border-slate-700">
                    {saasFeatures.map((item) => (
                      <li key={item} className="flex items-center gap-4 text-sm text-slate-300">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/#contact"
                    className="inline-flex items-center gap-2 font-semibold text-white transition-opacity hover:opacity-80"
                  >
                    {t("services.saas.cta")}{" "}
                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white/40 p-10 backdrop-blur-xl transition-all duration-500 hover:border-blue-500/30 hover:bg-white/80 dark:border-white/5 dark:bg-[#0A0A0F]/60 dark:hover:bg-white/[0.03]">
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white dark:bg-white/5 dark:text-white">
                  <Layers size={24} strokeWidth={1.5} />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                  {t("services.templates.title")}
                </h3>
                <p className="mb-10 flex-grow font-light leading-relaxed text-slate-600 dark:text-slate-400">
                  {t("services.templates.description")}
                </p>
                <ul className="mb-10 space-y-4 border-t border-slate-200 pt-8 dark:border-white/5">
                  {templateFeatures.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-4 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
                >
                  {t("services.templates.cta")}{" "}
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="relative z-20 mb-20 mt-40">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 p-10 text-center dark:border-slate-700 dark:bg-slate-800 sm:p-20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 opacity-50" />
              <div className="relative z-10 mx-auto max-w-2xl">
                <h2 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  {t("cta.title")}
                </h2>
                <p className="mb-10 text-lg font-light text-slate-400">{t("cta.description")}</p>
                <Link
                  href="/#contact"
                  className="inline-block rounded-full bg-white px-10 py-4 font-semibold text-slate-900 transition-transform hover:scale-105 active:scale-95"
                >
                  {t("cta.button")}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}

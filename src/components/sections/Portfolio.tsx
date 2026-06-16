"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMessages, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { PortfolioBackground } from "@/components/portfolio/PortfolioBackground";
import { PortfolioParallaxImage } from "@/components/portfolio/PortfolioParallaxImage";
import { GsapReveal } from "@/components/ui/GsapReveal";
import { GsapSectionHeading } from "@/components/ui/GsapSectionHeading";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Link } from "@/i18n/navigation";
import { getProjectsFromMessages } from "@/lib/projects";
import { gentleSpring, motionTransition, scaleTap } from "@/lib/motion";
import type { ProjectCategory } from "@/types";

export function Portfolio() {
  const t = useTranslations("portfolio");
  const messages = useMessages() as Parameters<typeof getProjectsFromMessages>[0];
  const projects = useMemo(() => getProjectsFromMessages(messages), [messages]);
  const [activeFilter, setActiveFilter] = useState<"all" | ProjectCategory>("all");
  const reducedMotion = useReducedMotion();

  const filters: { id: "all" | ProjectCategory; label: string }[] = [
    { id: "all", label: t("filters.all") },
    { id: "projects", label: t("filters.projects") },
    { id: "react", label: t("filters.react") },
  ];

  const filtered = useMemo(() => {
    if (activeFilter === "all") return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [activeFilter, projects]);

  const tapProps = scaleTap(reducedMotion);

  return (
    <section
      id="portfolio"
      className="section-padding relative scroll-mt-20 overflow-hidden bg-surface-muted/50"
    >
      <PortfolioBackground />
      <div className="relative z-10 mx-auto max-w-6xl">
        <GsapSectionHeading title={t("title")} description={t("description")} />

        <GsapReveal>
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <motion.button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? "text-white"
                      : "border border-border bg-surface text-secondary hover:border-primary hover:text-primary"
                  }`}
                  {...tapProps}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="portfolio-filter"
                      className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/25"
                      transition={motionTransition(reducedMotion, gentleSpring)}
                    />
                  ) : null}
                  <span className="relative z-10">{filter.label}</span>
                </motion.button>
              );
            })}
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <motion.li
                  key={project.slug}
                  layout
                  exit={
                    reducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.95, y: -8 }
                  }
                  transition={motionTransition(reducedMotion, gentleSpring)}
                >
                  <motion.article
                    className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
                    whileHover={
                      reducedMotion
                        ? undefined
                        : {
                            y: -6,
                            boxShadow:
                              "0 20px 40px -12px color-mix(in srgb, var(--primary) 18%, transparent)",
                          }
                    }
                    transition={gentleSpring}
                  >
                    <PortfolioParallaxImage src={project.coverImage} alt={project.title} />
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground transition-transform duration-300 group-hover:-translate-y-0.5">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-sm text-secondary transition-transform duration-300 delay-75 group-hover:-translate-y-0.5">
                        {project.subtitle}
                      </p>
                      <Link
                        href={`/portfolio/${project.slug}`}
                        className="group/link relative mt-4 inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover"
                      >
                        <span className="relative">
                          {t("viewCaseStudy")}
                          <span className="absolute -bottom-0.5 left-1/2 h-px w-0 -translate-x-1/2 bg-primary transition-all duration-300 group-hover/link:w-full" />
                        </span>
                        <motion.span
                          className="ml-1"
                          aria-hidden
                          initial={false}
                          whileHover={reducedMotion ? undefined : { x: 4, opacity: 1 }}
                        >
                          →
                        </motion.span>
                      </Link>
                    </div>
                  </motion.article>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </GsapReveal>
      </div>
    </section>
  );
}

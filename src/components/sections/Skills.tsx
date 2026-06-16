"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { GsapReveal } from "@/components/ui/GsapReveal";
import { GsapSectionHeading } from "@/components/ui/GsapSectionHeading";
import { SectionAmbientBackground } from "@/components/ui/SectionAmbientBackground";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { skills } from "@/content/skills";

function SkillBar({
  name,
  level,
  animate,
  reducedMotion,
}: {
  name: string;
  level: number;
  animate: boolean;
  reducedMotion: boolean;
}) {
  const width = reducedMotion || animate ? `${level}%` : "0%";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{name}</span>
        <span className="tabular-nums text-secondary">{level}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full bg-primary ${reducedMotion ? "" : "transition-[width] duration-500 ease-out"}`}
          style={{ width }}
          role="progressbar"
          aria-valuenow={level}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={name}
        />
      </div>
    </div>
  );
}

export function Skills() {
  const t = useTranslations("skills");
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setAnimate(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const midpoint = Math.ceil(skills.length / 2);
  const columns = [skills.slice(0, midpoint), skills.slice(midpoint)];

  return (
    <section id="skills" className="section-padding relative scroll-mt-20 overflow-hidden bg-surface-muted/50">
      <SectionAmbientBackground />
      <div ref={ref} className="relative z-10 mx-auto max-w-6xl">
        <GsapSectionHeading title={t("title")} description={t("description")} />
        <GsapReveal>
          <div className="section-card grid gap-8 p-8 sm:p-12 md:grid-cols-2">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="space-y-6">
                {column.map((skill) => (
                  <SkillBar
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    animate={animate}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            ))}
          </div>
        </GsapReveal>
      </div>
    </section>
  );
}

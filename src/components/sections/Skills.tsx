"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { skills } from "@/content/site-data";

function SkillBar({ name, level, animate }: { name: string; level: number; animate: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{name}</span>
        <span className="tabular-nums text-secondary">{level}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-out"
          style={{ width: animate ? `${level}%` : "0%" }}
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
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
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
  }, []);

  const midpoint = Math.ceil(skills.length / 2);
  const columns = [skills.slice(0, midpoint), skills.slice(midpoint)];

  return (
    <section id="skills" className="section-padding scroll-mt-20 bg-surface-muted/50">
      <div ref={ref} className="mx-auto max-w-6xl">
        <SectionHeading
          title="Taidot"
          description="Ohjelmointi- ja työkalutaitoni tällä hetkellä."
        />
        <div className="section-card grid gap-8 p-6 sm:p-10 md:grid-cols-2">
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-6">
              {column.map((skill) => (
                <SkillBar
                  key={skill.name}
                  name={skill.name}
                  level={skill.level}
                  animate={animate}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

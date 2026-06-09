"use client";

import { motion } from "motion/react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeUp, motionTransition, staggerContainer, staggerItem } from "@/lib/motion";
import type { ProjectCaseStudy } from "@/types";

type SectionKey = "role" | "problem" | "approach" | "outcome";

type ProjectCaseStudyAnimatedProps = {
  caseStudy: ProjectCaseStudy;
  labels: Record<SectionKey, string> & { learnings: string };
};

export function ProjectCaseStudyAnimated({ caseStudy, labels }: ProjectCaseStudyAnimatedProps) {
  const reducedMotion = useReducedMotion();
  const { ref, isInView } = useInView({ threshold: 0.1 });

  const sections: { key: SectionKey; content: string }[] = [
    { key: "role", content: caseStudy.role },
    { key: "problem", content: caseStudy.problem },
    { key: "approach", content: caseStudy.approach },
    { key: "outcome", content: caseStudy.outcome },
  ];

  return (
    <div ref={ref} className="mt-10 space-y-6">
      <motion.h2
        className="font-display text-2xl font-bold tracking-tight"
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={motionTransition(reducedMotion)}
      >
        {caseStudy.title}
      </motion.h2>

      <motion.div
        className="grid gap-6 lg:grid-cols-2"
        variants={staggerContainer(reducedMotion)}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {sections.map((section) => (
          <motion.div
            key={section.key}
            className="section-card p-6"
            variants={staggerItem(reducedMotion)}
            style={{ perspective: 800 }}
          >
            <motion.div
              variants={{
                hidden: reducedMotion ? {} : { rotateX: 3, opacity: 0, y: 16 },
                visible: { rotateX: 0, opacity: 1, y: 0 },
              }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                {labels[section.key]}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-secondary sm:text-base">
                {section.content}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {caseStudy.learnings.length > 0 ? (
        <motion.div
          className="section-card p-6"
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={motionTransition(reducedMotion, { delay: 0.2 })}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
            {labels.learnings}
          </h3>
          <motion.ul
            className="mt-4 space-y-2"
            variants={staggerContainer(reducedMotion)}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {caseStudy.learnings.map((item) => (
              <motion.li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-secondary sm:text-base"
                variants={staggerItem(reducedMotion)}
              >
                <motion.span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden
                  initial={reducedMotion ? false : { scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={motionTransition(reducedMotion, { duration: 0.3 })}
                />
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      ) : null}
    </div>
  );
}

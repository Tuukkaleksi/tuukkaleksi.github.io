"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Link } from "@/i18n/navigation";
import { fadeUp, gentleSpring, motionTransition, staggerContainer, staggerItem } from "@/lib/motion";

type MetaRow = {
  label: string;
  value: string;
  href?: string;
};

type ProjectPageMotionProps = {
  backLabel: string;
  detailsLabel: string;
  descriptionLabel: string;
  subtitle: string;
  title: string;
  description: string;
  descriptionTitle?: string;
  meta: MetaRow[];
  thumbnails: string[];
  children: ReactNode;
};

export function ProjectPageMotion({
  backLabel,
  detailsLabel,
  descriptionLabel,
  subtitle,
  title,
  description,
  descriptionTitle,
  meta,
  thumbnails,
  children,
}: ProjectPageMotionProps) {
  const reducedMotion = useReducedMotion();
  const { ref: sidebarRef, isInView: sidebarInView } = useInView({ threshold: 0.15 });
  const { ref: thumbsRef, isInView: thumbsInView } = useInView({ threshold: 0.2 });

  return (
    <>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={motionTransition(reducedMotion, gentleSpring)}
      >
        <Link
          href="/#portfolio"
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <motion.span whileHover={reducedMotion ? undefined : { x: -3 }} transition={gentleSpring}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </motion.span>
          {backLabel}
        </Link>
      </motion.div>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {children}

        <motion.div
          ref={sidebarRef}
          className="space-y-8"
          variants={staggerContainer(reducedMotion)}
          initial="hidden"
          animate={sidebarInView ? "visible" : "hidden"}
        >
          <motion.div variants={staggerItem(reducedMotion)}>
            <motion.p
              className="text-sm font-medium uppercase tracking-wide text-primary"
              variants={fadeUp}
            >
              {subtitle}
            </motion.p>
            <motion.h1
              className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl"
              variants={fadeUp}
            >
              {title}
            </motion.h1>
          </motion.div>

          <motion.div className="section-card p-6" variants={staggerItem(reducedMotion)}>
            <h2 className="font-display text-lg font-semibold">{detailsLabel}</h2>
            <dl className="mt-4 space-y-3">
              {meta.map((row) => (
                <motion.div
                  key={row.label}
                  className="border-b border-border pb-3 last:border-0 last:pb-0"
                  variants={fadeUp}
                >
                  <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {row.href ? (
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover"
                      >
                        {row.value}
                        <motion.span whileHover={reducedMotion ? undefined : { x: 2, y: -2 }}>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </motion.span>
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </motion.div>

          <motion.div className="section-card p-6" variants={staggerItem(reducedMotion)}>
            <h2 className="font-display text-lg font-semibold">
              {descriptionTitle ?? descriptionLabel}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-secondary sm:text-base">
              {description}
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        ref={thumbsRef}
        className="mt-10 flex flex-wrap gap-3"
        variants={staggerContainer(reducedMotion)}
        initial="hidden"
        animate={thumbsInView ? "visible" : "hidden"}
      >
        {thumbnails.map((src, i) => (
          <motion.div
            key={`${src}-${i}`}
            className="relative h-20 w-28 overflow-hidden rounded-lg border border-border bg-surface-muted"
            variants={staggerItem(reducedMotion)}
            whileHover={reducedMotion ? undefined : { scale: 1.05, y: -2 }}
            transition={gentleSpring}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="112px"
              aria-hidden={i > 0}
            />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

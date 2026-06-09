"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeIn, gentleSpring, motionTransition, scaleTap, slideHorizontal } from "@/lib/motion";

type ProjectGalleryProps = {
  images: string[];
  title: string;
};

export function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const t = useTranslations("gallery");
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const reducedMotion = useReducedMotion();
  const tapProps = scaleTap(reducedMotion);

  const go = useCallback(
    (delta: number) => {
      setDirection(delta > 0 ? 1 : -1);
      setIndex((i) => (i + delta + images.length) % images.length);
    },
    [images.length, index],
  );

  const goTo = useCallback(
    (i: number) => {
      setDirection(i > index ? 1 : -1);
      setIndex(i);
    },
    [index],
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  const slideVariants = slideHorizontal(direction, reducedMotion);

  return (
    <>
      <motion.div
        className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-surface-muted"
        whileHover={reducedMotion ? undefined : { scale: 1.005 }}
        transition={gentleSpring}
      >
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
          aria-label={t("openImage", { title })}
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={motionTransition(reducedMotion, { duration: 0.35, ease: "easeInOut" })}
          >
            <Image
              src={images[index]}
              alt={t("imageAlt", { title, index: index + 1 })}
              fill
              className="object-contain p-2"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
          </motion.div>
        </AnimatePresence>
        {images.length > 1 ? (
          <>
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-foreground shadow hover:bg-primary hover:text-white"
              aria-label={t("previous")}
              {...tapProps}
              whileHover={reducedMotion ? undefined : { scale: 1.08 }}
              whileTap={reducedMotion ? undefined : { scale: 0.92 }}
            >
              <motion.span whileHover={reducedMotion ? undefined : { x: -2 }}>
                <ChevronLeft className="h-5 w-5" />
              </motion.span>
            </motion.button>
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-foreground shadow hover:bg-primary hover:text-white"
              aria-label={t("next")}
              {...tapProps}
              whileHover={reducedMotion ? undefined : { scale: 1.08 }}
              whileTap={reducedMotion ? undefined : { scale: 0.92 }}
            >
              <motion.span whileHover={reducedMotion ? undefined : { x: 2 }}>
                <ChevronRight className="h-5 w-5" />
              </motion.span>
            </motion.button>
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <motion.button
                  key={i}
                  type="button"
                  layout
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(i);
                  }}
                  className={`h-2 rounded-full ${
                    i === index ? "bg-primary" : "w-2 bg-white/80 dark:bg-white/40"
                  }`}
                  animate={{
                    width: i === index ? 24 : 8,
                  }}
                  whileHover={reducedMotion ? undefined : { scale: 1.2 }}
                  transition={motionTransition(reducedMotion, gentleSpring)}
                  aria-label={t("slide", { index: i + 1 })}
                />
              ))}
            </div>
          </>
        ) : null}
      </motion.div>

      <AnimatePresence>
        {lightboxOpen ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={t("dialog")}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={motionTransition(reducedMotion, { duration: 0.25 })}
          >
            <motion.button
              type="button"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
              aria-label={t("close")}
              whileHover={reducedMotion ? undefined : { rotate: 90, scale: 1.05 }}
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              transition={gentleSpring}
            >
              <X className="h-5 w-5" />
            </motion.button>
            <motion.div
              className="relative h-[80vh] w-full max-w-5xl"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
              transition={motionTransition(reducedMotion, gentleSpring)}
            >
              <Image
                src={images[index]}
                alt={t("enlargedAlt", { title })}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

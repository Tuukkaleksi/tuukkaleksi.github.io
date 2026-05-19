"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type ProjectGalleryProps = {
  images: string[];
  title: string;
};

export function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const go = (delta: number) => {
    setIndex((i) => (i + delta + images.length) % images.length);
  };

  return (
    <>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-surface-muted">
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Avaa kuva: ${title}`}
        />
        <Image
          src={images[index]}
          alt={`${title} — kuva ${index + 1}`}
          fill
          className="object-contain p-2"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-foreground shadow hover:bg-primary hover:text-white"
              aria-label="Edellinen kuva"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-foreground shadow hover:bg-primary hover:text-white"
              aria-label="Seuraava kuva"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  className={`h-2 w-2 rounded-full transition ${
                    i === index ? "bg-primary w-6" : "bg-white/80"
                  }`}
                  aria-label={`Kuva ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Kuvagalleria"
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
            aria-label="Sulje"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={images[index]}
              alt={`${title} — suurennettu`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

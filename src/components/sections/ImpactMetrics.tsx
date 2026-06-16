"use client";

import { useTranslations } from "next-intl";
import { GsapReveal } from "@/components/ui/GsapReveal";
import type { ImpactMetric } from "@/types";

export function ImpactMetrics() {
  const t = useTranslations("impactMetrics");
  const items = t.raw("items") as ImpactMetric[];

  return (
    <section id="impact" aria-label={t("ariaLabel")} className="relative z-10 px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto -mt-14 max-w-6xl sm:-mt-16">
        <GsapReveal>
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 shadow-lg shadow-black/5 sm:grid-cols-4 sm:gap-4 sm:p-6 lg:p-8">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center rounded-xl bg-surface-muted/60 px-3 py-4 text-center sm:px-4 sm:py-5"
              >
                <p className="font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                  {item.value}
                </p>
                <p className="mt-1 text-xs font-medium leading-snug text-secondary sm:text-sm">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </GsapReveal>
      </div>
    </section>
  );
}

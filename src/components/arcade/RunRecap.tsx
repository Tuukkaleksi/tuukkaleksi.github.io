"use client";

import { useTranslations } from "next-intl";
import type { GameStats } from "@/lib/arcade";

type RunRecapProps = {
  stats: GameStats;
  variant?: "default" | "panel";
};

export function RunRecap({ stats, variant = "default" }: RunRecapProps) {
  const t = useTranslations("arcade.runRecap");
  const r = stats.runStats;

  const rows = [
    { label: t("time"), value: `${Math.floor(r.timeSurvived)}s` },
    { label: t("kills"), value: String(r.kills) },
    { label: t("bestCombo"), value: String(r.bestCombo) },
    { label: t("nearMiss"), value: String(r.bestNearMissStreak) },
    ...(r.bossesDefeated > 0
      ? [{ label: t("bosses"), value: String(r.bossesDefeated) }]
      : []),
  ];

  if (variant === "panel") {
    return (
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
          {t("title")}
        </h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col">
              <dt className="text-[10px] uppercase tracking-wide text-white/35">{row.label}</dt>
              <dd className="font-display text-base font-semibold tabular-nums text-white/90">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  return (
    <div className="mt-3 w-full max-w-xs rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-left text-xs text-white/70">
      <p className="mb-2 font-display text-sm font-semibold text-white/90">{t("title")}</p>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.label}>
            {row.label}: {row.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

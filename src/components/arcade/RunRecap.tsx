"use client";

import { useTranslations } from "next-intl";
import type { GameStats } from "@/lib/arcade";

type RunRecapProps = {
  stats: GameStats;
};

export function RunRecap({ stats }: RunRecapProps) {
  const t = useTranslations("arcade.runRecap");
  const r = stats.runStats;

  return (
    <div className="mt-3 w-full max-w-xs rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-left text-xs text-white/70">
      <p className="mb-2 font-display text-sm font-semibold text-white/90">{t("title")}</p>
      <ul className="space-y-1">
        <li>
          {t("time")}: {Math.floor(r.timeSurvived)}s
        </li>
        <li>
          {t("kills")}: {r.kills}
        </li>
        <li>
          {t("bestCombo")}: {r.bestCombo}
        </li>
        <li>
          {t("nearMiss")}: {r.bestNearMissStreak}
        </li>
        {r.bossesDefeated > 0 && (
          <li>
            {t("bosses")}: {r.bossesDefeated}
          </li>
        )}
      </ul>
    </div>
  );
}

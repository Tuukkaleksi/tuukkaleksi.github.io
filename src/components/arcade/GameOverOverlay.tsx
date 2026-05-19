"use client";

import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { GameStats } from "@/lib/arcade";
import type { DeathMessageKey } from "@/lib/arcade/death-messages";
import { isGlobalLeaderboardSubmitEnabled } from "@/lib/neon-drift/feature-flags";
import { LeaderboardSubmit } from "@/components/arcade/LeaderboardSubmit";
import { RunRecap } from "@/components/arcade/RunRecap";

type RunSession = {
  runToken: string;
  startedAt: number;
};

type GameOverOverlayProps = {
  stats: GameStats;
  deathKey: DeathMessageKey;
  runSession: RunSession | null;
  submitDismissed: boolean;
  onDismissSubmit: () => void;
  onRetry: () => void;
  onMenu: () => void;
};

export function GameOverOverlay({
  stats,
  deathKey,
  runSession,
  submitDismissed,
  onDismissSubmit,
  onRetry,
  onMenu,
}: GameOverOverlayProps) {
  const t = useTranslations("arcade.gameOver");
  const tArcade = useTranslations("arcade");
  const globalSubmit = isGlobalLeaderboardSubmitEnabled();
  const isNewRecord = stats.score >= stats.highScore && stats.score > 0;
  const showGlobalSubmit = globalSubmit && runSession && !submitDismissed;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="presentation"
    >
      <div
        className="pointer-events-auto mb-[env(safe-area-inset-bottom)] w-full max-w-md select-text touch-auto sm:mb-0"
        role="dialog"
        aria-labelledby="gameover-title"
        aria-describedby="gameover-score"
      >
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0c10] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]">
          <div
            className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            aria-hidden
          />

          <div className="p-6 sm:p-7">
            <header className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                {t("eyebrow")}
              </p>
              <h2
                id="gameover-title"
                className="mt-1.5 font-display text-lg font-semibold text-white/90 sm:text-xl"
              >
                {tArcade(deathKey)}
              </h2>

              <div className="mt-6">
                <p
                  id="gameover-score"
                  className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40"
                >
                  {t("scoreLabel")}
                </p>
                <p className="mt-1 font-display text-5xl font-bold tabular-nums tracking-tight text-white sm:text-[3.25rem]">
                  {stats.score.toLocaleString()}
                </p>
                {isNewRecord && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-200/95">
                    <Trophy className="h-3.5 w-3.5" aria-hidden />
                    {t("newRecord")}
                  </p>
                )}
              </div>
            </header>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <span className="text-xs font-medium text-white/45">{t("localBest")}</span>
              <span className="font-display text-xl font-semibold tabular-nums text-white/95">
                {stats.highScore.toLocaleString()}
              </span>
            </div>

            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <RunRecap stats={stats} variant="panel" />
            </div>

            {showGlobalSubmit ? (
              <LeaderboardSubmit
                stats={stats}
                session={runSession}
                onDismiss={onDismissSubmit}
              />
            ) : (
              <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
                <p className="text-sm font-medium text-white/75">{t("globalPausedTitle")}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                  {t("globalPausedBody")}
                </p>
                <Link
                  href="/neon-drift/signin"
                  className="mt-3 inline-block text-xs font-medium text-primary transition hover:text-primary-hover"
                >
                  {t("globalPausedCta")} →
                </Link>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={onMenu}
                className="flex-1 rounded-xl border border-white/12 bg-transparent py-3 text-sm font-medium text-white/75 transition hover:border-white/22 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
              >
                {t("menu")}
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {t("retry")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

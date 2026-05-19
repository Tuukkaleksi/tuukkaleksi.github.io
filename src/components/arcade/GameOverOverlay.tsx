"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import type { GameStats } from "@/lib/arcade";
import type { DeathMessageKey } from "@/lib/arcade/death-messages";
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
  onExit: () => void;
};

export function GameOverOverlay({
  stats,
  deathKey,
  runSession,
  submitDismissed,
  onDismissSubmit,
  onRetry,
  onExit,
}: GameOverOverlayProps) {
  const t = useTranslations("arcade");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const input = panelRef.current?.querySelector<HTMLInputElement>(
      "[data-leaderboard-initials]",
    );
    input?.focus();
  }, [runSession, submitDismissed]);

  const showLeaderboard = runSession && !submitDismissed;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-y-auto bg-[#06070a]/94 px-4 py-8">
      <div
        ref={panelRef}
        className="arcade-gameover-panel pointer-events-auto w-full max-w-md select-text touch-auto"
        role="dialog"
        aria-labelledby="gameover-title"
      >
        <header className="text-center">
          <p
            id="gameover-title"
            className="font-display text-2xl font-bold tracking-wide text-rose-300 sm:text-3xl"
            style={{ textShadow: "0 0 24px rgba(251, 113, 133, 0.45)" }}
          >
            {t(deathKey)}
          </p>
          <div className="mt-4 inline-flex flex-col items-center gap-1 rounded-2xl border border-primary/25 bg-primary/10 px-8 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/70">
              {t("score")}
            </span>
            <span className="font-display text-3xl font-bold tabular-nums text-white sm:text-4xl">
              {stats.score.toLocaleString()}
            </span>
            {stats.score >= stats.highScore && stats.score > 0 && (
              <span className="mt-0.5 rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                {t("newRecord")}
              </span>
            )}
          </div>
        </header>

        <div className="arcade-gameover-body mt-5 space-y-4 rounded-2xl border border-white/[0.08] bg-[#0a0b0f]/90 p-5 shadow-[0_0_48px_-12px_rgba(59,158,255,0.2)]">
          <RunRecap stats={stats} variant="panel" />
          {showLeaderboard && (
            <LeaderboardSubmit
              stats={stats}
              session={runSession}
              onDismiss={onDismissSubmit}
            />
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="min-w-[8.5rem] rounded-full bg-primary px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("retry")}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="min-w-[8.5rem] rounded-full border border-white/20 bg-white/[0.04] px-7 py-2.5 text-sm font-medium text-white/90 transition hover:border-white/35 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
          >
            {t("exit")}
          </button>
        </div>
      </div>
    </div>
  );
}

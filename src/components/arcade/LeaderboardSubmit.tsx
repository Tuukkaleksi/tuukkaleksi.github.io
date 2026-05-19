"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import type { GameStats } from "@/lib/arcade";
import { MIN_SUBMIT_SCORE } from "@/lib/neon-drift/schema";

type RunSession = {
  runToken: string;
  startedAt: number;
};

type LeaderboardSubmitProps = {
  stats: GameStats;
  session: RunSession;
  onDismiss: () => void;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const ERROR_KEYS = [
  "SUBMIT_FAILED",
  "RATE_LIMIT",
  "VALIDATION",
  "INITIALS_INVALID",
  "TOKEN_INVALID",
  "TIMING_INVALID",
  "RUN_IMPLAUSIBLE",
  "LEADERBOARD_DISABLED",
] as const;

type ErrorKey = (typeof ERROR_KEYS)[number];

function isErrorKey(code: string): code is ErrorKey {
  return (ERROR_KEYS as readonly string[]).includes(code);
}

const SLOT_COUNT = 4;

export function LeaderboardSubmit({ stats, session, onDismiss }: LeaderboardSubmitProps) {
  const t = useTranslations("arcade.leaderboard");
  const [initials, setInitials] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [rank, setRank] = useState<number | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const normalized = initials.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, SLOT_COUNT);
  const valid = /^[A-Z0-9]{2,4}$/.test(normalized);

  const submit = useCallback(async () => {
    if (!valid || state === "submitting") return;

    setState("submitting");
    setErrorCode(null);

    const r = stats.runStats;
    try {
      const res = await fetch("/api/neon-drift/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initials: normalized,
          score: stats.score,
          wave: stats.wave,
          round: stats.round,
          timeSurvivedSec: Math.floor(r.timeSurvived),
          kills: r.kills,
          bestCombo: r.bestCombo,
          bossesDefeated: r.bossesDefeated,
          runToken: session.runToken,
          startedAt: session.startedAt,
        }),
      });

      const data = (await res.json()) as { ok: boolean; rank?: number; error?: string };

      if (data.ok && typeof data.rank === "number") {
        setRank(data.rank);
        setState("success");
        return;
      }

      setErrorCode(data.error ?? "SUBMIT_FAILED");
      setState("error");
    } catch {
      setErrorCode("SUBMIT_FAILED");
      setState("error");
    }
  }, [normalized, valid, state, stats, session]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter" && valid && state !== "submitting") {
      e.preventDefault();
      void submit();
    }
  };

  if (stats.score < MIN_SUBMIT_SCORE) {
    return null;
  }

  if (state === "success" && rank !== null) {
    return (
      <section className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300/80">
          {t("submitted")}
        </p>
        <p className="mt-1 font-display text-3xl font-bold tabular-nums text-amber-100">#{rank}</p>
        <p className="mt-1 text-xs text-white/45">{t("submittedHint")}</p>
      </section>
    );
  }

  return (
    <section className="mt-6 border-t border-white/[0.06] pt-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        {t("submitTitle")}
      </h3>
      <p className="mt-1 text-xs text-white/35">{t("submitHint")}</p>

      <div className="mt-3 flex gap-2">
        <input
          id="leaderboard-initials"
          data-leaderboard-initials
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={initials}
          onChange={(e) => {
            setInitials(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, SLOT_COUNT));
            if (state === "error") setState("idle");
          }}
          onKeyDown={onInputKeyDown}
          maxLength={SLOT_COUNT}
          placeholder={t("initialsPlaceholder")}
          className="min-w-0 flex-1 rounded-xl border border-white/12 bg-black/40 px-4 py-2.5 text-center font-mono text-lg font-bold tracking-[0.35em] text-white uppercase placeholder:tracking-normal placeholder:font-sans placeholder:font-medium placeholder:text-white/25 focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/15"
          aria-label={t("initialsLabel")}
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!valid || state === "submitting"}
          className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "submitting" ? "…" : t("submit")}
        </button>
      </div>

      {state === "error" && errorCode && (
        <p className="mt-2 text-xs text-rose-300/90" role="alert">
          {isErrorKey(errorCode) ? t(`errors.${errorCode}`) : t("errors.SUBMIT_FAILED")}
        </p>
      )}

      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 text-xs text-white/30 transition hover:text-white/55"
      >
        {t("skip")}
      </button>
    </section>
  );
}

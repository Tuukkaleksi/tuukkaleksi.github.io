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

  const onInputChange = (value: string) => {
    setInitials(value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, SLOT_COUNT));
    if (state === "error") setState("idle");
  };

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
      <section className="arcade-leaderboard-submit border-t border-white/[0.06] pt-4">
        <div className="rounded-xl border border-amber-400/25 bg-gradient-to-b from-amber-400/10 to-transparent px-4 py-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300/80">
            {t("submitted")}
          </p>
          <p className="mt-1 font-display text-3xl font-bold text-amber-100">#{rank}</p>
          <p className="mt-1 text-xs text-white/45">{t("submittedHint")}</p>
        </div>
      </section>
    );
  }

  const chars = normalized.padEnd(SLOT_COUNT, " ").split("");

  return (
    <section className="arcade-leaderboard-submit border-t border-sky-400/15 pt-4">
      <div>
        <h3 className="font-display text-sm font-semibold text-sky-200">{t("submitTitle")}</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-white/40">{t("submitHint")}</p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-center gap-1.5 sm:gap-2" aria-hidden>
          {chars.map((ch, i) => (
            <span
              key={i}
              className={`flex h-11 w-9 items-center justify-center rounded-lg border font-mono text-base font-bold sm:h-12 sm:w-10 sm:text-lg ${
                ch.trim()
                  ? "border-primary/40 bg-primary/10 text-white shadow-[0_0_12px_-4px_rgba(59,158,255,0.5)]"
                  : "border-white/10 bg-black/40 text-white/25"
              }`}
            >
              {ch.trim() || "·"}
            </span>
          ))}
        </div>

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
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          maxLength={SLOT_COUNT}
          placeholder={t("initialsPlaceholder")}
          className="mx-auto block w-full max-w-[14rem] rounded-xl border border-white/15 bg-black/50 py-3 text-center font-mono text-xl font-bold tracking-[0.45em] text-white uppercase placeholder:tracking-normal placeholder:text-white/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label={t("initialsLabel")}
          aria-describedby="leaderboard-initials-hint"
        />
        <p id="leaderboard-initials-hint" className="text-center text-[10px] text-white/30">
          {t("initialsLabel")} · A–Z, 0–9
        </p>
      </div>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={!valid || state === "submitting"}
        className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-35"
      >
        {state === "submitting" ? t("submitting") : t("submit")}
      </button>

      {state === "error" && errorCode && (
        <p className="mt-2 text-center text-xs text-rose-300/90" role="alert">
          {isErrorKey(errorCode) ? t(`errors.${errorCode}`) : t("errors.SUBMIT_FAILED")}
        </p>
      )}

      <button
        type="button"
        onClick={onDismiss}
        className="mt-3 w-full text-center text-[11px] text-white/30 transition hover:text-white/55"
      >
        {t("skip")}
      </button>
    </section>
  );
}

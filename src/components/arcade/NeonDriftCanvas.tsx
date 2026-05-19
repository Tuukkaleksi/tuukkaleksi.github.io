"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArcadeAudio } from "@/lib/arcade/audio";
import { pickDeathMessageKey, type DeathMessageKey } from "@/lib/arcade/death-messages";
import { NeonDriftGame, type GameStats } from "@/lib/arcade";
import type { PowerUpId } from "@/lib/arcade/power-ups";
import { readThemeColors } from "@/lib/arcade/theme";
import type { VisualQuality } from "@/lib/arcade/config/visual";
import type { GamePhase } from "@/lib/arcade/types";
import { PowerUpDraft } from "@/components/arcade/PowerUpDraft";
import { RunRecap } from "@/components/arcade/RunRecap";

const MOVE_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "Space",
  "KeyK",
]);

const ACTIVE_PHASES: GamePhase[] = ["playing", "bossFight", "bossIntro"];

type NeonDriftCanvasProps = {
  active: boolean;
  onClose: () => void;
};

export function NeonDriftCanvas({ active, onClose }: NeonDriftCanvasProps) {
  const t = useTranslations("arcade");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<NeonDriftGame | null>(null);
  const audioRef = useRef<ArcadeAudio | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [muted, setMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.32);
  const [scorePop, setScorePop] = useState(false);
  const [deathKey, setDeathKey] = useState<DeathMessageKey>("deathDriftFailed");
  const [overloadPulse, setOverloadPulse] = useState(false);
  const [draftChoices, setDraftChoices] = useState<PowerUpId[]>([]);
  const [hudPowerId, setHudPowerId] = useState<PowerUpId | null>(null);
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [bossLabel, setBossLabel] = useState<string | null>(null);
  const [visualQuality, setVisualQuality] = useState<VisualQuality>("auto");

  const visualQualityLabel = (q: VisualQuality) => {
    switch (q) {
      case "auto":
        return t("visualAuto");
      case "high":
        return t("visualHigh");
      case "medium":
        return t("visualMedium");
      case "low":
        return t("visualLow");
      case "off":
        return t("visualOff");
    }
  };

  const cycleVisualQuality = () => {
    const order: VisualQuality[] = ["auto", "medium", "low", "off", "high"];
    const next = order[(order.indexOf(visualQuality) + 1) % order.length]!;
    setVisualQuality(next);
    gameRef.current?.setVisualQuality(next);
  };

  const bindKeys = useCallback((game: NeonDriftGame) => {
    const held = new Set<string>();

    const sync = () => {
      game.setInput({
        left: held.has("ArrowLeft") || held.has("KeyA"),
        right: held.has("ArrowRight") || held.has("KeyD"),
        up: held.has("ArrowUp") || held.has("KeyW"),
        down: held.has("ArrowDown") || held.has("KeyS"),
        fire: held.has("Space") || held.has("KeyK"),
      });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const p = game.getStats().phase;
      if (p === "draft") {
        if (e.key === "1" || e.key === "2" || e.key === "3") {
          e.preventDefault();
          game.pickDraft(Number(e.key) - 1);
        }
        return;
      }
      if (e.key === "Escape") {
        if (p === "playing" || p === "paused" || p === "bossFight") {
          e.preventDefault();
          game.togglePause();
        } else if (p === "gameover") {
          onClose();
        }
        return;
      }
      if (
        (e.code === "ShiftLeft" || e.code === "ShiftRight") &&
        (p === "playing" || p === "bossFight")
      ) {
        e.preventDefault();
        game.queueDash();
      }
      if (MOVE_KEYS.has(e.code)) {
        e.preventDefault();
        held.add(e.code);
        sync();
      }
      if (e.key === "Enter" && game.getStats().phase === "ready") {
        e.preventDefault();
        void audioRef.current?.resume().then(() => game.start());
      }
      if (e.key === "Enter" && game.getStats().phase === "gameover") {
        e.preventDefault();
        void audioRef.current?.resume().then(() => game.restart());
      }
      if (e.key === "p" || e.key === "P") {
        const ph = game.getStats().phase;
        if (ph === "playing" || ph === "paused" || ph === "bossFight") {
          e.preventDefault();
          game.togglePause();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      held.delete(e.code);
      sync();
    };

    const onBlur = () => {
      held.clear();
      sync();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [onClose]);

  const handlePhase = useCallback((p: GamePhase) => {
    setPhase(p);
    if (p === "gameover") setDeathKey(pickDeathMessageKey());
    if (p === "playing") {
      setDraftChoices([]);
      setBossLabel(null);
    }
    if (p === "bossFight") setBossLabel(null);
  }, []);

  const handleScorePop = useCallback(() => {
    setScorePop(true);
    window.setTimeout(() => setScorePop(false), 360);
  }, []);

  const handleOverload = useCallback(() => {
    setOverloadPulse(true);
    window.setTimeout(() => setOverloadPulse(false), 2400);
  }, []);

  const handleDraft = useCallback((choices: PowerUpId[]) => {
    setDraftChoices(choices);
  }, []);

  const handleAchievement = useCallback(
    (id: string) => {
      setAchievementToast(id);
      window.setTimeout(() => setAchievementToast(null), 3200);
    },
    [],
  );

  const handleBossTelegraph = useCallback((bossId: string) => {
    setBossLabel(bossId);
  }, []);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const audio = new ArcadeAudio();
    audioRef.current = audio;
    audio.preloadMusic();
    setMusicVolume(audio.getMusicVolume());

    const game = new NeonDriftGame(canvas, readThemeColors(), audio, {
      onStats: setStats,
      onPhase: handlePhase,
      onScorePop: handleScorePop,
      onOverload: handleOverload,
      onDraft: handleDraft,
      onAchievement: handleAchievement,
      onBossTelegraph: handleBossTelegraph,
    });
    gameRef.current = game;
    setStats(game.getStats());
    setPhase("ready");
    setVisualQuality(game.getVisualQuality());

    game.run();
    const unbindKeys = bindKeys(game);

    const ro = new ResizeObserver(() => game.resize());
    ro.observe(canvas);

    const onPointerAim = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      game.pointerAim(e.clientX, e.clientY, rect);
    };
    const onPointerLeave = () => game.clearPointerAim();

    canvas.addEventListener("pointermove", onPointerAim);
    canvas.addEventListener("pointerenter", onPointerAim);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointercancel", onPointerLeave);

    return () => {
      unbindKeys();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerAim);
      canvas.removeEventListener("pointerenter", onPointerAim);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointercancel", onPointerLeave);
      audio.stopMusic();
      game.destroy();
      gameRef.current = null;
      setPhase("ready");
      setStats(null);
    };
  }, [
    active,
    bindKeys,
    handlePhase,
    handleScorePop,
    handleOverload,
    handleDraft,
    handleAchievement,
    handleBossTelegraph,
  ]);

  useEffect(() => {
    if (!active || !ACTIVE_PHASES.includes(phase)) return;
    const tick = () => setHudPowerId(gameRef.current?.getHudPowerId() ?? null);
    tick();
    const id = window.setInterval(tick, 120);
    return () => window.clearInterval(id);
  }, [active, phase]);

  useEffect(() => {
    audioRef.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  const startGame = async () => {
    const audio = audioRef.current;
    await audio?.resume();
    gameRef.current?.start();
  };

  const onMusicVolume = (v: number) => {
    setMusicVolume(v);
    audioRef.current?.setMusicVolume(v);
  };

  const showHud = ACTIVE_PHASES.includes(phase);
  const showStats = stats && (showHud || phase === "paused");

  let overlay: React.ReactNode = null;
  if (phase === "ready") {
    overlay = (
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0b0f]/88 px-6 text-center">
        <p className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{t("title")}</p>
        <p className="max-w-sm text-sm text-white/70">{t("tagline")}</p>
        <button
          type="button"
          onClick={startGame}
          className="pointer-events-auto mt-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("start")}
        </button>
        <p className="text-xs text-white/45">{t("controls")}</p>
      </div>
    );
  } else if (phase === "draft") {
    overlay = (
      <PowerUpDraft
        choices={draftChoices}
        onPick={(i) => {
          gameRef.current?.pickDraft(i);
          setDraftChoices([]);
        }}
      />
    );
  } else if (phase === "bossIntro" && bossLabel) {
    overlay = (
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 px-6 text-center">
        <p className="font-display text-sm tracking-[0.3em] text-fuchsia-300/80">{t("bossIncoming")}</p>
        <p className="font-display text-2xl font-bold text-white sm:text-3xl">
          {t(`bosses.${bossLabel}`)}
        </p>
        <p className="max-w-md text-sm text-white/55">{t(`bosses.${bossLabel}Intro`)}</p>
      </div>
    );
  } else if (phase === "paused") {
    overlay = (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
        <p className="font-display text-2xl font-semibold text-white">{t("paused")}</p>
      </div>
    );
  } else if (phase === "gameover" && stats) {
    overlay = (
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 px-6 text-center">
        <p className="font-display text-2xl font-bold tracking-wide text-rose-300 drop-shadow-[0_0_12px_rgba(251,113,133,0.5)]">
          {t(deathKey)}
        </p>
        <p className="text-lg text-white/80">
          {t("score")}: <span className="font-semibold text-primary">{stats.score}</span>
        </p>
        {stats.score >= stats.highScore && stats.score > 0 && (
          <p className="text-sm font-medium text-amber-300">{t("newRecord")}</p>
        )}
        <RunRecap stats={stats} />
        <div className="pointer-events-auto mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => gameRef.current?.restart()}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            {t("retry")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/25 px-6 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
          >
            {t("exit")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full touch-none select-none">
      <canvas ref={canvasRef} className="block h-full w-full" aria-label={t("title")} />
      {overloadPulse && (
        <div
          className="arcade-overload-flash pointer-events-none absolute inset-0 flex items-start justify-center pt-[18vh]"
          aria-hidden
        >
          <span className="font-display text-2xl font-bold tracking-[0.2em] text-fuchsia-300/90 sm:text-3xl">
            {t("driftOverload")}
          </span>
        </div>
      )}
      {achievementToast && (
        <div className="pointer-events-none absolute left-1/2 top-24 z-10 -translate-x-1/2 rounded-full border border-amber-400/40 bg-black/70 px-4 py-2 text-center text-xs text-amber-200">
          {t("achievementUnlocked")}: {t(`achievements.${achievementToast}`)}
        </div>
      )}
      {overlay}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-6">
        <div className="pointer-events-auto flex flex-col gap-1 text-white">
          <span className="font-display text-lg font-bold tracking-wide sm:text-xl">{t("title")}</span>
          {showStats && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/65 sm:text-sm">
              <span className={scorePop ? "arcade-score-pop inline-block" : "inline-block"}>
                {t("score")}: <strong className="text-white">{stats.score}</strong>
              </span>
              <span>
                {t("wave")}: {stats.wave}
              </span>
              <span>
                {t("round")}: {stats.round}
              </span>
              {stats.combo > 1 && (
                <span className="text-amber-300">
                  {t("combo")} x{stats.combo}
                </span>
              )}
              {stats.nearMissStreak > 2 && (
                <span className="text-cyan-300/90">×{stats.nearMissStreak}</span>
              )}
              <span>
                {t("lives")}: {"♥".repeat(Math.max(0, stats.lives))}
              </span>
            </div>
          )}
          {showStats && stats.activeSynergies.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {stats.activeSynergies.map((id) => (
                <span
                  key={id}
                  className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary/90"
                >
                  {t(`synergies.${id}`)}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          <span className="hidden text-xs text-white/40 sm:inline">
            {t("highScore")}: {stats?.highScore ?? 0}
          </span>
          <button
            type="button"
            onClick={cycleVisualQuality}
            className="rounded-lg border border-white/15 px-2 py-1.5 text-[10px] text-white/60 hover:bg-white/10"
            title={t("visualQuality")}
          >
            {visualQualityLabel(visualQuality)}
          </button>
          <label className="flex items-center gap-1.5 text-[10px] text-white/50">
            <span>{t("musicVolume")}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={musicVolume}
              onChange={(e) => onMusicVolume(Number(e.target.value))}
              className="h-1 w-16 accent-primary"
              aria-label={t("musicVolume")}
            />
          </label>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
            aria-pressed={muted}
          >
            {muted ? t("unmute") : t("mute")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
          >
            {t("close")}
          </button>
        </div>
      </header>
      {hudPowerId && showHud && (
        <footer className="pointer-events-none absolute inset-x-0 bottom-0 pb-5 text-center">
          <p className="font-display text-sm font-semibold tracking-widest text-primary/90">
            {t(`powerUps.${hudPowerId}`)}
          </p>
        </footer>
      )}
    </div>
  );
}

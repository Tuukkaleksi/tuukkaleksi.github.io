import { getTranslations } from "next-intl/server";
import {
  getLeaderboard,
  isLeaderboardEnabled,
  type LeaderboardEntry,
} from "@/lib/neon-drift/leaderboard";

export const dynamic = "force-dynamic";

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <ol className="mt-4 space-y-1">
      {entries.map((entry) => (
        <li
          key={`${entry.initials}-${entry.score}-${entry.createdAt}`}
          className="grid grid-cols-[2rem_3rem_1fr_3.5rem_3rem] items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-white/[0.03] sm:grid-cols-[2.5rem_3.5rem_1fr_4rem_3.5rem]"
        >
          <span className="font-mono text-xs text-sky-400/80">#{entry.rank}</span>
          <span className="font-mono font-semibold tracking-wider text-white">{entry.initials}</span>
          <span className="text-right font-semibold tabular-nums text-primary">
            {entry.score.toLocaleString()}
          </span>
          <span className="text-right text-xs text-white/45">W{entry.wave}</span>
          <span className="text-right text-xs text-white/35">{formatTime(entry.timeSurvivedSec)}</span>
        </li>
      ))}
    </ol>
  );
}

export async function LeaderboardPanel() {
  const t = await getTranslations("projects.items.neon-drift.leaderboard");
  const enabled = isLeaderboardEnabled();
  const entries = enabled ? await getLeaderboard(10) : [];

  return (
    <section className="neon-drift-leaderboard relative overflow-hidden rounded-2xl border border-primary/20 bg-[#0a0b0f] p-6">
      <div className="neon-drift-grid pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-400/70">
          {t("eyebrow")}
        </p>
        <h2 className="mt-1 font-display text-lg font-semibold text-white">{t("title")}</h2>
        <p className="mt-2 text-xs text-white/45">{t("subtitle")}</p>

        {!enabled ? (
          <p className="mt-6 rounded-lg border border-white/10 bg-black/30 px-4 py-6 text-center text-sm text-white/40">
            {t("offline")}
          </p>
        ) : entries.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-sky-400/20 bg-sky-400/5 px-4 py-8 text-center text-sm text-sky-200/60">
            {t("empty")}
          </p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-[2rem_3rem_1fr_3.5rem_3rem] gap-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/30 sm:grid-cols-[2.5rem_3.5rem_1fr_4rem_3.5rem]">
              <span>#</span>
              <span>{t("colInitials")}</span>
              <span className="text-right">{t("colScore")}</span>
              <span className="text-right">{t("colWave")}</span>
              <span className="text-right">{t("colTime")}</span>
            </div>
            <LeaderboardTable entries={entries} />
          </>
        )}
      </div>
    </section>
  );
}

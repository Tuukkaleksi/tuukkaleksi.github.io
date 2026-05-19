import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArcadeShell } from "@/components/arcade/ArcadeShell";
import { LeaderboardPanel } from "@/components/portfolio/neon-drift/LeaderboardPanel";
import { isGlobalLeaderboardSubmitEnabled } from "@/lib/neon-drift/feature-flags";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NeonDriftLeaderboardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("arcade.menu");
  const globalSubmit = isGlobalLeaderboardSubmitEnabled();

  return (
    <ArcadeShell>
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-center text-sm text-white/45">{t("leaderboardPageHint")}</p>
        {!globalSubmit && (
          <p className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-center text-xs leading-relaxed text-white/50">
            {t("leaderboardSubmitPaused")}
          </p>
        )}
        <div className={globalSubmit ? "mt-6" : "mt-4"}>
          <LeaderboardPanel />
        </div>
      </div>
    </ArcadeShell>
  );
}

import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ArcadeShell } from "@/components/arcade/ArcadeShell";
import { LeaderboardPanel } from "@/components/portfolio/neon-drift/LeaderboardPanel";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NeonDriftLeaderboardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("arcade.menu");

  return (
    <ArcadeShell>
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
        <p className="mb-6 text-center text-sm text-white/45">{t("leaderboardPageHint")}</p>
        <LeaderboardPanel />
      </div>
    </ArcadeShell>
  );
}

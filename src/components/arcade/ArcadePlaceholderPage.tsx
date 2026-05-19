import { getTranslations } from "next-intl/server";
import { ArcadeShell } from "@/components/arcade/ArcadeShell";

type PlaceholderKey = "shop" | "signin" | "register";

type ArcadePlaceholderPageProps = {
  pageKey: PlaceholderKey;
};

export async function ArcadePlaceholderPage({ pageKey }: ArcadePlaceholderPageProps) {
  const t = await getTranslations(`arcade.pages.${pageKey}`);

  return (
    <ArcadeShell>
      <div className="flex min-h-[min(70vh,32rem)] flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-400/70">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/45">{t("description")}</p>
        <p className="mt-6 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/35">
          {t("badge")}
        </p>
      </div>
    </ArcadeShell>
  );
}

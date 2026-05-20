import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function PilotAuthDisabled() {
  const t = await getTranslations("arcade.auth.disabled");

  return (
    <div className="mx-auto flex min-h-[min(70vh,28rem)] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-400/70">
        {t("eyebrow")}
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold text-white">{t("title")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-white/45">{t("description")}</p>
      <Link
        href="/neon-drift"
        className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
      >
        {t("back")}
      </Link>
    </div>
  );
}

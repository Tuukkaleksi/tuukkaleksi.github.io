import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("code")}</p>
      <h1 className="mt-2 font-display text-3xl font-bold">{t("title")}</h1>
      <p className="mt-3 max-w-md text-secondary">{t("description")}</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        {t("home")}
      </Link>
    </main>
  );
}

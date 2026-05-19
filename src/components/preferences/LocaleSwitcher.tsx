"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("preferences");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={
        compact
          ? "inline-flex rounded-lg border border-border bg-surface p-0.5"
          : "flex flex-col gap-1"
      }
    >
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        const label = loc === "fi" ? t("switchToFinnish") : t("switchToEnglish");
        return (
          <button
            key={loc}
            type="button"
            onClick={() => {
              if (!isActive) router.replace(pathname, { locale: loc });
            }}
            className={
              compact
                ? `rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-secondary hover:text-foreground"
                  }`
                : `rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    isActive ? "bg-primary/10 text-primary" : "text-secondary hover:bg-surface-muted"
                  }`
            }
            aria-pressed={isActive}
            aria-label={label}
          >
            {loc}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type ArcadeShellProps = {
  children: React.ReactNode;
  /** Full-bleed pages (shop) supply their own chrome. */
  bare?: boolean;
};

export function ArcadeShell({ children, bare = false }: ArcadeShellProps) {
  const t = useTranslations("arcade.shell");

  if (bare) {
    return <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] px-4 py-3 sm:px-6">
        <Link
          href="/neon-drift"
          className="inline-flex items-center gap-2 text-xs font-medium text-white/50 transition hover:text-white/85"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {t("back")}
        </Link>
        <Link
          href="/neon-drift"
          className="font-display text-sm font-semibold tracking-wide text-white/80 transition hover:text-white"
        >
          {t("title")}
        </Link>
        <span className="w-[5.5rem]" aria-hidden />
      </header>
      <main className="relative min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

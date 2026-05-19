"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type NavLink = {
  href: "/neon-drift/leaderboard" | "/neon-drift/shop" | "/neon-drift/signin" | "/neon-drift/register";
  labelKey: "leaderboard" | "shop" | "signIn" | "register";
};

const NAV_LINKS: NavLink[] = [
  { href: "/neon-drift/leaderboard", labelKey: "leaderboard" },
  { href: "/neon-drift/shop", labelKey: "shop" },
  { href: "/neon-drift/signin", labelKey: "signIn" },
  { href: "/neon-drift/register", labelKey: "register" },
];

type ArcadeMenuProps = {
  onPlay: () => void;
  highScore: number;
};

export function ArcadeMenu({ onPlay, highScore }: ArcadeMenuProps) {
  const t = useTranslations("arcade.menu");

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
      <header className="pointer-events-none px-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-center sm:pt-20">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-400/70">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)] sm:text-4xl">
          {t("title")}
        </h1>
        <nav
          className="pointer-events-auto mt-4 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-sm"
          aria-label={t("navLabel")}
        >
          {NAV_LINKS.map((link, i) => (
            <span key={link.href} className="inline-flex items-center">
              {i > 0 && <span className="mx-1.5 text-white/20" aria-hidden>·</span>}
              <Link
                href={link.href}
                className="font-medium text-white/55 transition hover:text-sky-300"
              >
                {t(link.labelKey)}
              </Link>
            </span>
          ))}
        </nav>
      </header>

      <div className="pointer-events-none flex flex-1 flex-col items-center justify-center px-6">
        <button
          type="button"
          onClick={onPlay}
          className="pointer-events-auto rounded-full bg-primary px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("play")}
        </button>
      </div>

      <footer className="pointer-events-auto px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center sm:pb-8">
        <p className="mx-auto max-w-xs text-sm text-white/50 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
          {t("tagline")}
        </p>
        {highScore > 0 && (
          <p className="mt-2 text-xs text-white/40">
            {t("localBest")}:{" "}
            <span className="font-semibold tabular-nums text-primary/90">
              {highScore.toLocaleString()}
            </span>
          </p>
        )}
        <p className="mt-3 text-[11px] text-white/30">{t("controls")}</p>
      </footer>
    </div>
  );
}

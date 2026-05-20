"use client";

import { ChevronDown, Gamepad2, LogIn, Trophy, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShopScrollRegion } from "@/components/arcade/shop/ShopScrollRegion";
import type { CosmeticCategory } from "@/lib/arcade/cosmetics";

const CATEGORY_KEYS: CosmeticCategory[] = [
  "skin",
  "trail",
  "grid",
  "deathFx",
  "berserkFx",
];

type ShopSidebarProps = {
  activeCategory: CosmeticCategory;
  onCategory: (cat: CosmeticCategory) => void;
  cosmeticsOpen: boolean;
  onToggleCosmetics: () => void;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  signedIn: boolean;
};

export function ShopSidebar({
  activeCategory,
  onCategory,
  cosmeticsOpen,
  onToggleCosmetics,
  terminalOpen,
  onToggleTerminal,
  signedIn,
}: ShopSidebarProps) {
  const t = useTranslations("arcade.shop");

  return (
    <aside className="shop-depot-sidebar flex h-full w-[min(100%,17.5rem)] shrink-0 flex-col overflow-hidden border-r border-white/[0.06] bg-[#07080c]/95">
      <div className="border-b border-white/[0.06] px-4 py-5">
        <Link
          href="/neon-drift"
          className="font-display text-sm font-bold tracking-[0.12em] text-white/90 transition hover:text-sky-300"
        >
          {t("depotName")}
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-sky-400/55">{t("depotTag")}</p>
      </div>

      <ShopScrollRegion className="flex-1">
        <nav className="px-2 py-3 pr-2" aria-label={t("navLabel")}>
        <div className="space-y-1">
          <button
            type="button"
            onClick={onToggleCosmetics}
            className="shop-depot-nav-group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-white/55 transition hover:bg-white/[0.04] hover:text-white/80"
            aria-expanded={cosmeticsOpen}
          >
            {t("nav.cosmetics")}
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${cosmeticsOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          {cosmeticsOpen && (
            <ul className="mb-2 space-y-0.5 border-l border-sky-500/20 pl-3 ml-2">
              {CATEGORY_KEYS.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => onCategory(cat)}
                    className={`shop-depot-nav-item w-full rounded-md px-2.5 py-2 text-left text-sm transition ${
                      activeCategory === cat
                        ? "bg-sky-500/15 font-medium text-sky-200"
                        : "text-white/50 hover:bg-white/[0.04] hover:text-white/75"
                    }`}
                  >
                    {t(`categories.${cat}`)}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={onToggleTerminal}
            className="shop-depot-nav-group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-white/55 transition hover:bg-white/[0.04] hover:text-white/80"
            aria-expanded={terminalOpen}
          >
            {t("nav.terminal")}
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${terminalOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          {terminalOpen && (
            <ul className="space-y-0.5 border-l border-white/10 pl-3 ml-2">
              <li>
                <Link
                  href="/neon-drift"
                  className="shop-depot-nav-link flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white/75"
                >
                  <Gamepad2 className="h-3.5 w-3.5 opacity-60" aria-hidden />
                  {t("nav.play")}
                </Link>
              </li>
              <li>
                <Link
                  href="/neon-drift/leaderboard"
                  className="shop-depot-nav-link flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white/75"
                >
                  <Trophy className="h-3.5 w-3.5 opacity-60" aria-hidden />
                  {t("nav.leaderboard")}
                </Link>
              </li>
              <li>
                <Link
                  href="/neon-drift/signin"
                  className="shop-depot-nav-link flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white/75"
                >
                  <LogIn className="h-3.5 w-3.5 opacity-60" aria-hidden />
                  {signedIn ? t("nav.signedIn") : t("nav.signIn")}
                </Link>
              </li>
              <li>
                <Link
                  href="/neon-drift/register"
                  className="shop-depot-nav-link flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white/75"
                >
                  <UserPlus className="h-3.5 w-3.5 opacity-60" aria-hidden />
                  {t("nav.register")}
                </Link>
              </li>
            </ul>
          )}
        </div>
        </nav>
      </ShopScrollRegion>

      <div className="shrink-0 border-t border-white/[0.06] px-4 py-4">
        <p className="text-[10px] leading-relaxed text-white/35">{t("sidebarHint")}</p>
      </div>
    </aside>
  );
}

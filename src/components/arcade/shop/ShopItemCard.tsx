"use client";

import { Check, Lock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CosmeticItem } from "@/lib/arcade/cosmetics";

type ShopItemCardProps = {
  item: CosmeticItem;
  name: string;
  description: string;
  rarityLabel: string;
  owned: boolean;
  equipped: boolean;
  selected: boolean;
  signedIn: boolean;
  onSelect: () => void;
  onEquip: () => void;
  onPurchase: () => void;
};

export function ShopItemCard({
  item,
  name,
  description,
  rarityLabel,
  owned,
  equipped,
  selected,
  signedIn,
  onSelect,
  onEquip,
  onPurchase,
}: ShopItemCardProps) {
  const t = useTranslations("arcade.shop");
  const paid = item.price > 0 && !owned;

  return (
    <article
      className={`shop-depot-card group relative flex flex-col overflow-hidden rounded-2xl border transition duration-300 ${
        selected
          ? "border-sky-400/50 shadow-[0_0_40px_-12px_rgba(56,189,248,0.45)]"
          : "border-white/[0.08] hover:border-white/20"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 flex-col text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400/60"
      >
        <div
          className="shop-depot-card-preview relative aspect-[5/3] w-full overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${item.preview[0]} 0%, ${item.preview[1]} 55%, #0a0b0d 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-transparent to-transparent" />
          <span
            className={`shop-depot-rarity absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider shop-depot-rarity--${item.rarity}`}
          >
            {rarityLabel}
          </span>
          {equipped && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
              <Check className="h-3 w-3" aria-hidden />
              {t("equipped")}
            </span>
          )}
          {!owned && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-medium text-white/70 backdrop-blur-sm">
              <Lock className="h-3 w-3" aria-hidden />
              {t("locked")}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-display text-base font-semibold text-white">{name}</h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-white/45">{description}</p>
          <div className="mt-auto flex items-center justify-between pt-2">
            {item.price > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-amber-200/90">
                <Sparkles className="h-3.5 w-3.5 text-amber-400/80" aria-hidden />
                {item.price} {t("credits")}
              </span>
            ) : (
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-400/70">
                {t("starter")}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="border-t border-white/[0.06] px-4 py-3">
        {owned ? (
          <button
            type="button"
            disabled={equipped}
            onClick={onEquip}
            className="w-full rounded-lg bg-sky-500/20 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-sky-200 transition hover:bg-sky-500/30 disabled:cursor-default disabled:opacity-45"
          >
            {equipped ? t("equipped") : t("equip")}
          </button>
        ) : paid ? (
          <button
            type="button"
            onClick={onPurchase}
            className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600/80 to-sky-600/80 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg shadow-fuchsia-900/20 transition hover:brightness-110"
          >
            {signedIn ? t("purchase") : t("purchaseSignIn")}
          </button>
        ) : null}
      </div>
    </article>
  );
}

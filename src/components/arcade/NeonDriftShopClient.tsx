"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ShopItemCard } from "@/components/arcade/shop/ShopItemCard";
import { ShopScrollRegion } from "@/components/arcade/shop/ShopScrollRegion";
import { ShopSidebar } from "@/components/arcade/shop/ShopSidebar";
import { AuthStatusBanner } from "@/components/arcade/auth/AuthStatusBanner";
import {
  COSMETIC_CATALOG,
  defaultCosmeticProfile,
  equipCosmetic,
  getCatalogByCategory,
  loadCosmeticProfile,
  purchaseCosmetic,
  type CosmeticCategory,
  type CosmeticId,
  type CosmeticItem,
  type CosmeticProfile,
} from "@/lib/arcade/cosmetics";
import {
  getPilotCallsign,
  isPilotVerified,
  sendVerificationEmail,
  signOut,
  useSession,
} from "@/lib/auth/client";

export function NeonDriftShopClient() {
  const t = useTranslations("arcade.shop");
  /** Match SSR — localStorage is applied after mount to avoid hydration mismatch. */
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = useState<CosmeticProfile>(defaultCosmeticProfile);
  const [resendLoading, setResendLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>("skin");
  const [selectedId, setSelectedId] = useState<CosmeticId>("skin.default");
  const [cosmeticsOpen, setCosmeticsOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  const signedIn = Boolean(session?.user);
  const verified = isPilotVerified(session);
  const callsign = getPilotCallsign(session);

  useEffect(() => {
    setProfile(loadCosmeticProfile());
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = "";
    };
  }, []);

  const items = useMemo(() => getCatalogByCategory(activeCategory), [activeCategory]);
  const selectedItem = useMemo(
    () => COSMETIC_CATALOG.find((c) => c.id === selectedId) ?? items[0],
    [selectedId, items],
  );

  const onEquip = useCallback((id: CosmeticId) => {
    setProfile((prev) => equipCosmetic(prev, id));
    setPurchaseNotice(null);
  }, []);

  const onPurchase = useCallback(
    (id: CosmeticId) => {
      if (!signedIn) {
        setPurchaseNotice("signInRequired");
        return;
      }
      if (!verified) {
        setPurchaseNotice("emailNotVerified");
        return;
      }
      setProfile((prev) => {
        const next = purchaseCosmetic(prev, id);
        if (!next) {
          setPurchaseNotice("purchaseFailed");
          return prev;
        }
        setPurchaseNotice("purchaseSuccess");
        return next;
      });
    },
    [signedIn, verified],
  );

  const onSignOut = useCallback(async () => {
    await signOut();
    window.location.href = "/neon-drift/signin";
  }, []);

  const onResendVerification = useCallback(async () => {
    const email = session?.user?.email;
    if (!email) return;
    setResendLoading(true);
    await sendVerificationEmail({
      email,
      callbackURL: `${window.location.origin}/neon-drift/verify-email?verified=1`,
    });
    setResendLoading(false);
  }, [session?.user?.email]);

  const rarityLabel = (rarity: CosmeticItem["rarity"]) => t(`rarity.${rarity}`);

  return (
    <div className="shop-depot flex h-full min-h-0 flex-1 overflow-hidden">
      <ShopSidebar
        activeCategory={activeCategory}
        onCategory={(cat) => {
          setActiveCategory(cat);
          const first = getCatalogByCategory(cat)[0];
          if (first) setSelectedId(first.id);
        }}
        cosmeticsOpen={cosmeticsOpen}
        onToggleCosmetics={() => setCosmeticsOpen((o) => !o)}
        terminalOpen={terminalOpen}
        onToggleTerminal={() => setTerminalOpen((o) => !o)}
        signedIn={signedIn}
        callsign={callsign}
        onSignOut={signedIn ? onSignOut : undefined}
      />

      <div className="shop-depot-main relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.12),transparent)]"
          aria-hidden
        />

        <header className="relative z-10 shrink-0 px-6 pb-2 pt-8 text-center sm:px-10 sm:pt-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-400/70">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/50">
            {t("description")}
          </p>
          {!isPending && !signedIn && (
            <p className="mx-auto mt-3 max-w-md rounded-full border border-amber-400/20 bg-amber-500/[0.06] px-4 py-1.5 text-xs text-amber-200/80">
              {t("browseOnly")}{" "}
              <Link href="/neon-drift/signin" className="font-medium text-amber-100 underline-offset-2 hover:underline">
                {t("signInCta")}
              </Link>
            </p>
          )}
          {signedIn && !verified && (
            <div className="mx-auto mt-4 max-w-lg px-2">
              <AuthStatusBanner
                email={session?.user?.email}
                onResend={onResendVerification}
                resendLoading={resendLoading}
              />
            </div>
          )}
        </header>

        {purchaseNotice && (
          <div
            className="relative z-10 mx-auto mb-2 max-w-lg rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-center text-xs text-white/70 backdrop-blur-md"
            role="status"
          >
            {t(`notices.${purchaseNotice}`)}
            <button
              type="button"
              className="ml-3 text-white/40 hover:text-white/70"
              onClick={() => setPurchaseNotice(null)}
              aria-label={t("dismiss")}
            >
              ×
            </button>
          </div>
        )}

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-4 pb-6 sm:px-8 lg:flex-row">
          <ShopScrollRegion className="min-h-0 flex-1 pr-3">
            <section className="px-1 pb-2">
              <div className="mb-4 flex items-end justify-between gap-4">
                <h2 className="font-display text-lg font-semibold text-white/90">
                  {t(`categories.${activeCategory}`)}
                </h2>
                <span className="text-xs text-white/35">
                  {items.length} {t("itemsCount")}
                </span>
              </div>
              <div className="shop-depot-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                  const owned = profile.unlocked.includes(item.id);
                  const equipped = profile.equipped[item.category] === item.id;
                  return (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      name={t(`items.${item.nameKey}`)}
                      description={t(`items.${item.descKey}`)}
                      rarityLabel={rarityLabel(item.rarity)}
                      owned={owned}
                      equipped={equipped}
                      selected={selectedId === item.id}
                      signedIn={signedIn && verified}
                      onSelect={() => setSelectedId(item.id)}
                      onEquip={() => onEquip(item.id)}
                      onPurchase={() => onPurchase(item.id)}
                    />
                  );
                })}
              </div>
            </section>
          </ShopScrollRegion>

          {selectedItem && (
            <aside className="shop-depot-detail hidden w-[min(100%,20rem)] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0d12]/90 backdrop-blur-md lg:flex">
              <div
                className="relative aspect-[4/3] w-full"
                style={{
                  background: `linear-gradient(145deg, ${selectedItem.preview[0]}, ${selectedItem.preview[1]}, #0a0b0d)`,
                }}
              >
                <div className="absolute inset-0 shop-depot-detail-scan" aria-hidden />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span
                  className={`w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider shop-depot-rarity--${selectedItem.rarity}`}
                >
                  {rarityLabel(selectedItem.rarity)}
                </span>
                <h3 className="font-display text-xl font-bold text-white">
                  {t(`items.${selectedItem.nameKey}`)}
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {t(`items.${selectedItem.descKey}`)}
                </p>
                <div className="mt-auto space-y-2 border-t border-white/[0.06] pt-4">
                  {profile.unlocked.includes(selectedItem.id) ? (
                    <button
                      type="button"
                      disabled={profile.equipped[selectedItem.category] === selectedItem.id}
                      onClick={() => onEquip(selectedItem.id)}
                      className="w-full rounded-lg bg-sky-500/25 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100 transition hover:bg-sky-500/35 disabled:opacity-45"
                    >
                      {profile.equipped[selectedItem.category] === selectedItem.id
                        ? t("equipped")
                        : t("equip")}
                    </button>
                  ) : selectedItem.price > 0 ? (
                    <button
                      type="button"
                      onClick={() => onPurchase(selectedItem.id)}
                      className="w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-sky-600 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-110"
                    >
                      {signedIn && verified ? t("purchase") : t("purchaseSignIn")}
                    </button>
                  ) : null}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

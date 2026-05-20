import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArcadeShell } from "@/components/arcade/ArcadeShell";
import { NeonDriftShopClient } from "@/components/arcade/NeonDriftShopClient";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "arcade.shop" });
  return {
    title: { absolute: `${t("title")} — Neon Drift` },
  };
}

export default async function NeonDriftShopPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ArcadeShell bare>
      <NeonDriftShopClient />
    </ArcadeShell>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "market" });
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function MarketLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}

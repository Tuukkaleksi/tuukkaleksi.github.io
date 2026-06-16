import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { buildSocialMetadata } from "@/lib/seo/metadata";
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
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title,
    description,
    ...buildSocialMetadata({ title, description }),
  };
}

export default async function MarketLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}

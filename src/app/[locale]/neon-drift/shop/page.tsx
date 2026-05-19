import { setRequestLocale } from "next-intl/server";
import { ArcadePlaceholderPage } from "@/components/arcade/ArcadePlaceholderPage";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NeonDriftShopPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ArcadePlaceholderPage pageKey="shop" />;
}

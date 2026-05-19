import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "arcade.shell" });
  return {
    title: t("title"),
    robots: { index: false, follow: true },
  };
}

export default async function NeonDriftLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="dark fixed inset-0 z-[90] flex flex-col bg-[#0a0b0d]">{children}</div>
  );
}

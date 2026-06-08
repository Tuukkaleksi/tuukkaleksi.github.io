import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Raleway } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BackToTop } from "@/components/layout/BackToTop";
import { AppProviders } from "@/components/providers/AppProviders";
import { ThemeInitScript } from "@/components/theme/ThemeInitScript";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";
import "../globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Raleway({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    const path = loc === routing.defaultLocale ? "" : `/${loc}`;
    languages[loc] = `${siteConfig.url}${path}`;
  }

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("title"),
      template: "%s",
    },
    description: t("description"),
    alternates: {
      canonical: languages[locale as Locale],
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: languages[locale as Locale],
      siteName: t("name"),
      locale: locale === "fi" ? "fi_FI" : "en_US",
      type: "website",
    },
    robots: { index: true, follow: true },
    icons: { icon: "/images/favicon.png" },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${display.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeInitScript />
        <AppProviders locale={locale as Locale} messages={messages}>
          <SiteHeader />
          <div className="lg:pl-20 xl:pl-24">{children}</div>
          <BackToTop />
        </AppProviders>
      </body>
    </html>
  );
}

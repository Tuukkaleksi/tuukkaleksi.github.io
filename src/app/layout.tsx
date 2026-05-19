import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Raleway } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BackToTop } from "@/components/layout/BackToTop";
import { siteConfig } from "@/lib/site";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "fi_FI",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" className={`${sans.variable} ${display.variable} scroll-smooth`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SiteHeader />
        <div className="lg:pl-20 xl:pl-24">{children}</div>
        <BackToTop />
      </body>
    </html>
  );
}

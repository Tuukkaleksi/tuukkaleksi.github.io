import { SiteFooter } from "@/components/layout/SiteFooter";
import { HomeExperience } from "@/components/home/HomeExperience";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { ImpactMetrics } from "@/components/sections/ImpactMetrics";
import { MarketTeaser } from "@/components/sections/MarketTeaser";
import { Notes } from "@/components/sections/Notes";
import { Portfolio } from "@/components/sections/Portfolio";
import { Resume } from "@/components/sections/Resume";
import { Skills } from "@/components/sections/Skills";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildHomeJsonLd } from "@/lib/seo/jsonld";
import type { Locale } from "@/i18n/routing";
import { setRequestLocale, getTranslations } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("site");

  return (
    <>
      <JsonLd data={buildHomeJsonLd(locale as Locale, t("name"), t("description"))} />
      <HomeExperience>
        <main>
          <Hero />
          <ImpactMetrics />
          <About />
          <Skills />
          <Resume />
          <Portfolio />
          <MarketTeaser />
          <Notes />
          <Contact />
        </main>
        <SiteFooter />
      </HomeExperience>
    </>
  );
}

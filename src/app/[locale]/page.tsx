import { SiteFooter } from "@/components/layout/SiteFooter";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { ImpactMetrics } from "@/components/sections/ImpactMetrics";
import { Notes } from "@/components/sections/Notes";
import { Portfolio } from "@/components/sections/Portfolio";
import { Resume } from "@/components/sections/Resume";
import { Skills } from "@/components/sections/Skills";
import { setRequestLocale } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <main>
        <Hero />
        <ImpactMetrics />
        <About />
        <Skills />
        <Resume />
        <Portfolio />
        <Notes />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}

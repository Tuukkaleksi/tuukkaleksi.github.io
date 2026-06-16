import { MonitorSmartphone, Layers, Zap, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AnimatedSectionHeading } from "@/components/ui/AnimatedSectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionAmbientBackground } from "@/components/ui/SectionAmbientBackground";
import { Link } from "@/i18n/navigation";

const serviceKeys = ["brand", "saas", "templates"] as const;

const serviceIcons = {
  brand: MonitorSmartphone,
  saas: Zap,
  templates: Layers,
} as const;

export async function MarketTeaser() {
  const t = await getTranslations("homeMarket");
  const tMarket = await getTranslations("market.services");

  return (
    <section id="services" className="section-padding relative scroll-mt-20 overflow-hidden">
      <SectionAmbientBackground />
      <div className="relative z-10 mx-auto max-w-6xl">
        <AnimatedSectionHeading title={t("title")} description={t("subtitle")} />
        <ScrollReveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serviceKeys.map((key) => {
              const Icon = serviceIcons[key];
              return (
                <article
                  key={key}
                  className="section-card flex flex-col p-6 transition hover:shadow-md sm:p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                    {tMarket(`${key}.title`)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary">
                    {tMarket(`${key}.description`)}
                  </p>
                </article>
              );
            })}
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/market"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover"
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

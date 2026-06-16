import { getTranslations } from "next-intl/server";
import { SoundCloudEmbed } from "@/components/about/SoundCloudEmbed";
import { GsapReveal } from "@/components/ui/GsapReveal";
import { GsapSectionHeading } from "@/components/ui/GsapSectionHeading";

export async function About() {
  const t = await getTranslations("about");
  const paragraphs = t.raw("paragraphs") as string[];
  const factKeys = ["birthYear", "city", "age", "degree"] as const;

  return (
    <section id="about" className="section-padding scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <GsapSectionHeading title={t("title")} />
        <GsapReveal>
          <div className="section-card p-8 sm:p-12">
            <h3 className="font-display text-2xl font-semibold text-foreground">{t("role")}</h3>
            <p className="mt-2 text-secondary italic">{t("tagline")}</p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {factKeys.map((key) => (
                <div
                  key={key}
                  className="rounded-lg border border-border bg-surface-muted/60 px-4 py-3"
                >
                  <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {t(`facts.${key}.label`)}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {t(`facts.${key}.value`)}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-secondary sm:text-base">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </GsapReveal>
        <div className="mt-8">
          <SoundCloudEmbed />
        </div>
      </div>
    </section>
  );
}

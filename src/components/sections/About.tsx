import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AnimatedSectionHeading } from "@/components/ui/AnimatedSectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const SOUNDCLOUD_EMBED =
  "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2169952617&color=%230563bb&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true";

export async function About() {
  const t = await getTranslations("about");
  const tSite = await getTranslations("site");
  const paragraphs = t.raw("paragraphs") as string[];
  const factKeys = ["birthYear", "city", "age", "degree"] as const;

  return (
    <section id="about" className="section-padding scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <AnimatedSectionHeading title={t("title")} />
        <ScrollReveal>
          <div className="section-card grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-12">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl bg-surface-muted lg:mx-0">
              <Image
                src="/images/naamakuva30112024.webp"
                alt={tSite("name")}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 280px, 320px"
                priority
              />
            </div>
            <div>
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
              <div className="mt-8 overflow-hidden rounded-xl border border-border">
                <iframe
                  title={t("soundcloudTitle")}
                  src={SOUNDCLOUD_EMBED}
                  className="h-[166px] w-full border-0"
                  loading="lazy"
                  allow="autoplay"
                />
                <p className="border-t border-border bg-surface-muted px-3 py-2 text-xs text-secondary">
                  <a
                    href="https://soundcloud.com/tjxkpulse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="prose-link"
                  >
                    TJXKPULSE
                  </a>
                  {" · "}
                  <a
                    href="https://soundcloud.com/tjxkpulse/fin-de-semana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="prose-link"
                  >
                    FIN DE SEMANA
                  </a>
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ResumeEntry } from "@/types";

function TimelineColumn({ title, items }: { title: string; items: ResumeEntry[] }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
      <ul className="mt-6 space-y-6">
        {items.map((item) => (
          <li
            key={`${item.title}-${item.period}`}
            className="relative border-l-2 border-primary/30 pl-6 before:absolute before:-left-[5px] before:top-1.5 before:h-2.5 before:w-2.5 before:rounded-full before:bg-primary"
          >
            <h4 className="font-semibold text-foreground">{item.title}</h4>
            {item.period ? (
              <p className="mt-1 text-sm font-medium text-primary">{item.period}</p>
            ) : null}
            {item.organization ? (
              <p className="mt-1 text-sm text-secondary">{item.organization}</p>
            ) : null}
            {item.description ? (
              <p className="mt-2 text-sm text-secondary">{item.description}</p>
            ) : null}
            {item.details ? (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-secondary">
                {item.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Resume() {
  const t = await getTranslations("resume");
  const tSite = await getTranslations("site");
  const education = t.raw("educationItems") as ResumeEntry[];
  const experience = t.raw("experienceItems") as ResumeEntry[];

  return (
    <section id="resume" className="section-padding scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={t("title")} />
        <div className="section-card space-y-10 p-6 sm:p-10">
          <div className="rounded-xl border border-border bg-surface-muted/50 p-6">
            <h3 className="font-display text-lg font-semibold">{t("profile")}</h3>
            <p className="mt-2 font-medium text-foreground">{tSite("name")}</p>
            <p className="mt-3 text-sm leading-relaxed text-secondary">{t("summary")}</p>
            <p className="mt-3 text-sm text-secondary">{tSite("location")}</p>
          </div>
          <div className="grid gap-10 lg:grid-cols-2">
            <TimelineColumn title={t("education")} items={education} />
            <TimelineColumn title={t("experience")} items={experience} />
          </div>
        </div>
      </div>
    </section>
  );
}

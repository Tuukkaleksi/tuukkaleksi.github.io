"use client";

import { ArrowRight, Calendar } from "lucide-react";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { useMemo } from "react";
import { GsapReveal } from "@/components/ui/GsapReveal";
import { GsapSectionHeading } from "@/components/ui/GsapSectionHeading";
import { Link } from "@/i18n/navigation";
import { getNotesFromMessages } from "@/lib/notes";

const HOME_PREVIEW_COUNT = 3;

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function Notes() {
  const t = useTranslations("notes");
  const locale = useLocale();
  const messages = useMessages() as Parameters<typeof getNotesFromMessages>[0];
  const notes = useMemo(() => getNotesFromMessages(messages), [messages]);
  const preview = notes.slice(0, HOME_PREVIEW_COUNT);

  return (
    <section id="notes" className="section-padding scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <GsapSectionHeading title={t("title")} description={t("description")} />

        <GsapReveal>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {preview.map((note) => (
              <li key={note.slug}>
                <article className="section-card flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-secondary">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    <time dateTime={note.publishedAt}>{formatDate(note.publishedAt, locale)}</time>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                    {note.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary">{note.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/notes/${note.slug}`}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    {t("readMore")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </GsapReveal>

        <GsapReveal className="mt-10 text-center" delay={0.08}>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            {t("viewAll")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </GsapReveal>
      </div>
    </section>
  );
}

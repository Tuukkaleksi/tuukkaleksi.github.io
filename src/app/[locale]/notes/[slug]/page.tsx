import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getMessagesForLocale } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";
import { getAllNoteSlugs, getNotesFromMessages } from "@/lib/notes";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllNoteSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const messages = getMessagesForLocale(locale as Locale);
  const note = getNotesFromMessages(messages).find((n) => n.slug === slug);
  const t = await getTranslations({ locale, namespace: "notes" });

  if (!note) return { title: t("notFound") };

  return {
    title: note.title,
    description: note.excerpt,
  };
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export default async function NotePage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const messages = getMessagesForLocale(locale as Locale);
  const note = getNotesFromMessages(messages).find((n) => n.slug === slug);
  const t = await getTranslations("notes");

  if (!note) notFound();

  return (
    <>
      <main className="section-padding mx-auto max-w-3xl">
        <Link
          href="/notes"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("back")}
        </Link>

        <article>
          <div className="flex flex-wrap items-center gap-2 text-sm text-secondary">
            <Calendar className="h-4 w-4" aria-hidden />
            <time dateTime={note.publishedAt}>{formatDate(note.publishedAt, locale)}</time>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {note.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="section-card mt-8 space-y-5 p-6 sm:p-8">
            {note.body.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-secondary sm:text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

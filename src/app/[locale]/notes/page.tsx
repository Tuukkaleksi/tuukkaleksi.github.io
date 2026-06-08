import type { Metadata } from "next";
import { ArrowLeft, Calendar } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getMessagesForLocale } from "@/i18n/messages";
import type { Locale } from "@/i18n/routing";
import { getNotesFromMessages } from "@/lib/notes";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "notes" });
  return { title: t("title"), description: t("description") };
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export default async function NotesIndexPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = getMessagesForLocale(locale as Locale);
  const notes = getNotesFromMessages(messages);
  const t = await getTranslations("notes");

  return (
    <>
      <main className="section-padding mx-auto max-w-4xl">
        <Link
          href="/#notes"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("backHome")}
        </Link>

        <header className="mb-10">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 max-w-2xl text-secondary">{t("description")}</p>
        </header>

        <ul className="space-y-6">
          {notes.map((note) => (
            <li key={note.slug}>
              <article className="section-card p-6 transition hover:shadow-md">
                <div className="flex flex-wrap items-center gap-2 text-xs text-secondary">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  <time dateTime={note.publishedAt}>{formatDate(note.publishedAt, locale)}</time>
                </div>
                <h2 className="mt-3 font-display text-xl font-semibold">
                  <Link
                    href={`/notes/${note.slug}`}
                    className="text-foreground hover:text-primary"
                  >
                    {note.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{note.excerpt}</p>
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
              </article>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}

import { socialLinks } from "@/content/social-links";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/site";

function localeUrl(locale: Locale, path = ""): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${siteConfig.url}${prefix}${path}`;
}

export function buildHomeJsonLd(locale: Locale, name: string, description: string) {
  const url = localeUrl(locale);

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name,
      description,
      url,
      inLanguage: locale === "fi" ? "fi-FI" : "en-US",
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name,
      url,
      jobTitle: "Web Developer",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Oulu",
        addressCountry: "FI",
      },
      sameAs: socialLinks.map((link) => link.href),
    },
  ];
}

export function buildArticleJsonLd(
  locale: Locale,
  article: { title: string; excerpt: string; slug: string; publishedAt: string },
) {
  const url = localeUrl(locale, `/notes/${article.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: localeUrl(locale),
    },
    url,
    inLanguage: locale === "fi" ? "fi-FI" : "en-US",
  };
}

export function buildCreativeWorkJsonLd(
  locale: Locale,
  project: { title: string; description: string; slug: string; coverImage: string },
) {
  const url = localeUrl(locale, `/portfolio/${project.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url,
    image: project.coverImage.startsWith("http")
      ? project.coverImage
      : `${siteConfig.url}${project.coverImage}`,
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: localeUrl(locale),
    },
    inLanguage: locale === "fi" ? "fi-FI" : "en-US",
  };
}

import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllNoteSlugs } from "@/lib/notes";
import { getAllProjectSlugs } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

function localePath(locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${siteConfig.url}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const projectSlugs = getAllProjectSlugs();
  const noteSlugs = getAllNoteSlugs();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({
      url: localePath(locale, ""),
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, localePath(loc, "")]),
        ),
      },
    });

    entries.push({
      url: localePath(locale, "/notes"),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, localePath(loc, "/notes")]),
        ),
      },
    });

    entries.push({
      url: localePath(locale, "/market"),
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, localePath(loc, "/market")]),
        ),
      },
    });

    for (const slug of projectSlugs) {
      entries.push({
        url: localePath(locale, `/portfolio/${slug}`),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, localePath(loc, `/portfolio/${slug}`)]),
          ),
        },
      });
    }

    for (const slug of noteSlugs) {
      entries.push({
        url: localePath(locale, `/notes/${slug}`),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, localePath(loc, `/notes/${slug}`)]),
          ),
        },
      });
    }
  }

  return entries;
}

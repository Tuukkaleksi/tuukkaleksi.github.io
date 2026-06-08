import { noteBases } from "@/content/notes-base";
import type { NoteMeta } from "@/types";

type NoteTranslation = {
  title: string;
  excerpt: string;
  body: string[];
};

export function getNotesFromMessages(
  messages: { notes: { items: Record<string, NoteTranslation> } },
): NoteMeta[] {
  return noteBases
    .map((base) => {
      const translation = messages.notes.items[base.slug];
      if (!translation) return null;

      return {
        slug: base.slug,
        publishedAt: base.publishedAt,
        tags: base.tags,
        title: translation.title,
        excerpt: translation.excerpt,
        body: translation.body,
      };
    })
    .filter((note): note is NoteMeta => note !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getAllNoteSlugs(): string[] {
  return noteBases.map((n) => n.slug);
}

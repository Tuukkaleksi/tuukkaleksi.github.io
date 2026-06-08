export type NoteBase = {
  slug: string;
  publishedAt: string;
  tags: string[];
};

export const noteBases: NoteBase[] = [
  {
    slug: "portfolio-next16-rebuild",
    publishedAt: "2026-02-15",
    tags: ["next.js", "portfolio", "i18n"],
  },
  {
    slug: "neon-drift-survival-loop",
    publishedAt: "2026-01-20",
    tags: ["game-design", "typescript", "canvas"],
  },
  {
    slug: "narrative-puzzles-on-the-web",
    publishedAt: "2026-03-01",
    tags: ["game-design", "next.js", "puzzle"],
  },
];

import type { ProjectCategory } from "@/types";

export type ProjectBase = {
  slug: string;
  category: ProjectCategory;
  coverImage: string;
  images: string[];
};

export const projectBases: ProjectBase[] = [
  {
    slug: "neon-drift",
    category: "projects",
    coverImage: "/images/portfolio/neon-drift-cover.svg",
    images: ["/images/portfolio/neon-drift-cover.svg"],
  },
  {
    slug: "eternal-cry",
    category: "projects",
    coverImage: "/images/portfolio/Eternal-Cry.webp",
    images: [
      "/images/portfolio/Eternal-Cry.webp",
      "/images/portfolio/eternalcry2.png",
      "/images/portfolio/eternalcry3.png",
    ],
  },
  {
    slug: "nothing-pending",
    category: "react",
    coverImage: "/images/portfolio/nothing-pending/nothing-pending-0.png",
    images: [
      "/images/portfolio/nothing-pending/nothing-pending-0.png",
      "/images/portfolio/nothing-pending/nothing-pending-1.png",
    ],
  },
  {
    slug: "the-archive-incident",
    category: "react",
    coverImage: "/images/portfolio/the-archive-incident/the-archive-incident-0.png",
    images: [
      "/images/portfolio/the-archive-incident/the-archive-incident-0.png",
      "/images/portfolio/the-archive-incident/the-archive-incident-1.png",
      "/images/portfolio/the-archive-incident/the-archive-incident-2.png",
    ],
  },
];

const neonDriftPlayUrl = process.env.NEXT_PUBLIC_NEON_DRIFT_URL?.trim();

export const projectMetaLinks: Record<
  string,
  { href?: string; value: string }[]
> = {
  "neon-drift": neonDriftPlayUrl
    ? [{ value: "Play Neon Drift", href: neonDriftPlayUrl }]
    : [],
  "nothing-pending": [],
  "the-archive-incident": [],
};

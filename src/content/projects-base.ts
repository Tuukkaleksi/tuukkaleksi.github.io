import type { ProjectCategory } from "@/types";

export type ProjectBase = {
  slug: string;
  category: ProjectCategory;
  coverImage: string;
  images: string[];
};

export const projectBases: ProjectBase[] = [
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
    slug: "asiakasprojekti",
    category: "projects",
    coverImage: "/images/portfolio/asiakasprojekti.png",
    images: ["/images/portfolio/asiakasprojekti.png", "/images/portfolio/asiakasprojekti2.png"],
  },
  {
    slug: "tic-tac-toe",
    category: "react",
    coverImage: "/images/portfolio/tictactoe1.png",
    images: ["/images/portfolio/tictactoe1.png", "/images/portfolio/tictactoe2.png"],
  },
  {
    slug: "sudoku",
    category: "react",
    coverImage: "/images/portfolio/sudoku1.png",
    images: ["/images/portfolio/sudoku1.png", "/images/portfolio/tictactoe2.png"],
  },
  {
    slug: "vectorama",
    category: "projects",
    coverImage: "/images/portfolio/vectorama1.png",
    images: [
      "/images/portfolio/vectorama1.png",
      "/images/portfolio/vectorama2.png",
      "/images/portfolio/vectorama3.png",
    ],
  },
  {
    slug: "text-adventure",
    category: "react",
    coverImage: "/images/portfolio/txtadv/1.PNG",
    images: [
      "/images/portfolio/txtadv/1.PNG",
      "/images/portfolio/txtadv/2.PNG",
      "/images/portfolio/txtadv/3.PNG",
    ],
  },
  {
    slug: "wordle",
    category: "react",
    coverImage: "/images/portfolio/wordle-1.png",
    images: [
      "/images/portfolio/wordle-1.png",
      "/images/portfolio/wordle-2.png",
      "/images/portfolio/wordle-3.png",
    ],
  },
];

export const projectMetaLinks: Record<
  string,
  { href?: string; value: string }[]
> = {
  "eternal-cry": [
    { value: "eternalcry.000webhostapp.com", href: "https://eternalcry.000webhostapp.com" },
  ],
  asiakasprojekti: [{ value: "heikkilanmarja.fi", href: "https://heikkilanmarja.fi/" }],
  "tic-tac-toe": [
    { value: "tuukkaleksi.github.io/tic-tac-toe", href: "https://tuukkaleksi.github.io/tic-tac-toe" },
  ],
  sudoku: [
    { value: "tuukkaleksi.github.io/sudoku", href: "https://tuukkaleksi.github.io/sudoku" },
    { value: "github.com/Tuukkaleksi/sudoku", href: "https://github.com/Tuukkaleksi/sudoku" },
  ],
  vectorama: [
    { value: "Github — Mielihurjaus", href: "https://github.com/Tuukkaleksi/Mielihurjaus" },
    { value: "poetic-otter-e26763.netlify.app", href: "https://poetic-otter-e26763.netlify.app/" },
  ],
  "text-adventure": [
    { value: "github.com/Tuukkaleksi/text-adventure", href: "https://github.com/Tuukkaleksi/text-adventure" },
  ],
  wordle: [
    {
      value: "github.com/Tuukkaleksi/wordle-project",
      href: "https://github.com/Tuukkaleksi/wordle-project/tree/master",
    },
  ],
};

import type { ProjectMeta } from "@/types";

export const projects: ProjectMeta[] = [
  {
    slug: "eternal-cry",
    title: "Eternal-Cry",
    subtitle: "Videopeli",
    category: "projects",
    coverImage: "/images/portfolio/Eternal-Cry.webp",
    images: [
      "/images/portfolio/Eternal-Cry.webp",
      "/images/portfolio/eternalcry2.png",
      "/images/portfolio/eternalcry3.png",
    ],
    meta: [
      { label: "Kategoria", value: "Peliohjelmointi" },
      { label: "Koodikielet", value: "C++ / Java / Script" },
      { label: "Projektin URL", value: "eternalcry.000webhostapp.com", href: "https://eternalcry.000webhostapp.com" },
    ],
    descriptionTitle: "Eternal-Cry — selostus",
    description:
      "Toimintatasohyppelypeli, jossa on laaja tarina, toimintaa, salaisuuksia ja vihollisia. Pelin toteutukseen on käytetty GameMaker Studioa. Olen aloittanut myös projektin nettisivuston. Projekti on tällä hetkellä tauolla.",
  },
  {
    slug: "asiakasprojekti",
    title: "Asiakasprojekti",
    subtitle: "Nettisivusto",
    category: "projects",
    coverImage: "/images/portfolio/asiakasprojekti.png",
    images: ["/images/portfolio/asiakasprojekti.png", "/images/portfolio/asiakasprojekti2.png"],
    meta: [
      { label: "Kategoria", value: "Web-suunnittelu ja toteutus" },
      { label: "Koodikielet", value: "WordPress / HTML / CSS" },
      { label: "Asiakas", value: "Heikkilän Tila" },
      { label: "Aloitettu", value: "Marraskuu 2022" },
      { label: "URL", value: "heikkilanmarja.fi", href: "https://heikkilanmarja.fi/" },
    ],
    description:
      "Nettisivuston suunnittelu ja toteutus WordPressillä. Projektissa käytetty plugineja, itse tehtyjä kuvia ja erillisiä CSS-tiedostoja.",
  },
  {
    slug: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    subtitle: "React-sovellus",
    category: "react",
    coverImage: "/images/portfolio/tictactoe1.png",
    images: ["/images/portfolio/tictactoe1.png", "/images/portfolio/tictactoe2.png"],
    meta: [
      { label: "Kategoria", value: "React App" },
      { label: "Koodikielet", value: "React" },
      { label: "Päivämäärä", value: "31. maaliskuuta 2023" },
      {
        label: "Demo",
        value: "tuukkaleksi.github.io/tic-tac-toe",
        href: "https://tuukkaleksi.github.io/tic-tac-toe",
      },
    ],
    description:
      "Ensimmäinen React-projektini: suunnittelu ja toteutus itse. Responsiivinen mobiilille. Koodi saatavilla GitHubissa linkin kautta.",
  },
  {
    slug: "sudoku",
    title: "Sudoku",
    subtitle: "JavaScript-peli",
    category: "react",
    coverImage: "/images/portfolio/sudoku1.png",
    images: ["/images/portfolio/sudoku1.png", "/images/portfolio/tictactoe2.png"],
    meta: [
      { label: "Kategoria", value: "Web-peli" },
      { label: "Koodikielet", value: "HTML, CSS, JavaScript" },
      { label: "Päivämäärä", value: "10. huhtikuuta 2023" },
      {
        label: "Demo",
        value: "tuukkaleksi.github.io/sudoku",
        href: "https://tuukkaleksi.github.io/sudoku",
      },
      {
        label: "Lähdekoodi",
        value: "github.com/Tuukkaleksi/sudoku",
        href: "https://github.com/Tuukkaleksi/sudoku",
      },
    ],
    description:
      "Sudoku-projekti toteutettu HTML:llä, CSS:llä ja JavaScriptillä. Ei vielä täysin responsiivinen. Lähdekoodi GitHubissa.",
  },
  {
    slug: "vectorama",
    title: "Vectorama",
    subtitle: "Verkkopeli",
    category: "projects",
    coverImage: "/images/portfolio/vectorama1.png",
    images: [
      "/images/portfolio/vectorama1.png",
      "/images/portfolio/vectorama2.png",
      "/images/portfolio/vectorama3.png",
    ],
    meta: [
      { label: "Kategoria", value: "HTML / Web Game" },
      { label: "Koodikielet", value: "TypeScript, JavaScript, CSS, Node.js" },
      { label: "Päivämäärä", value: "20. huhtikuuta 2023" },
      {
        label: "Lähdekoodi",
        value: "Github — Mielihurjaus",
        href: "https://github.com/Tuukkaleksi/Mielihurjaus",
      },
      {
        label: "Demo",
        value: "poetic-otter-e26763.netlify.app",
        href: "https://poetic-otter-e26763.netlify.app/",
      },
    ],
    description:
      "Vectorama-tapahtumaan tehty Kahoot-tyylinen selainpeli, jossa pelaajien tarkoitus on arvata kuka on tekoäly. OpenAI API ja Firebase. Chat-huone työn alla.",
  },
  {
    slug: "text-adventure",
    title: "Text Adventure",
    subtitle: "AI-tarinapeli",
    category: "react",
    coverImage: "/images/portfolio/txtadv/1.PNG",
    images: [
      "/images/portfolio/txtadv/1.PNG",
      "/images/portfolio/txtadv/2.PNG",
      "/images/portfolio/txtadv/3.PNG",
    ],
    meta: [
      { label: "Kategoria", value: "Vite + React" },
      { label: "Koodikielet", value: "React / CSS" },
      { label: "Aloitettu", value: "Heinäkuu 2023" },
      {
        label: "Lähdekoodi",
        value: "github.com/Tuukkaleksi/text-adventure",
        href: "https://github.com/Tuukkaleksi/text-adventure",
      },
    ],
    descriptionTitle: "Vite React — selostus",
    description:
      "Harjoitusprojekti React-moduuleihin. Tekstiseikkailu, jossa tekoäly aloittaa ja jatkaa tarinaa; käyttäjä voi ohjata suuntaa. Kehitystä jatketaan.",
  },
  {
    slug: "wordle",
    title: "Wordle",
    subtitle: "React / React Native",
    category: "react",
    coverImage: "/images/portfolio/wordle-1.png",
    images: [
      "/images/portfolio/wordle-1.png",
      "/images/portfolio/wordle-2.png",
      "/images/portfolio/wordle-3.png",
    ],
    meta: [
      { label: "Kategoria", value: "React / React Native" },
      { label: "Koodikielet", value: "React / React Native" },
      { label: "Aloitettu", value: "Marraskuu 2022" },
      {
        label: "Lähdekoodi",
        value: "github.com/Tuukkaleksi/wordle-project",
        href: "https://github.com/Tuukkaleksi/wordle-project/tree/master",
      },
    ],
    description:
      "Wordle-tyylinen peli: pelaaja arvaa sanan viidessä yrityksessä. Tavoitteena web- ja mobiilisovellus Reactilla ja React Nativella.",
  },
];

export function getProjectBySlug(slug: string): ProjectMeta | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}

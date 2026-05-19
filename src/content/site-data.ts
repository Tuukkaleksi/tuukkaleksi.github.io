import type { NavItem, ResumeEntry, Skill, SocialLink } from "@/types";

export const navItems: NavItem[] = [
  { id: "hero", label: "Etusivu", href: "#hero" },
  { id: "about", label: "Tietoa", href: "#about" },
  { id: "resume", label: "Ansioluettelo", href: "#resume" },
  { id: "portfolio", label: "Portfolio", href: "#portfolio" },
  { id: "contact", label: "Ota yhteyttä", href: "#contact" },
];

export const socialLinks: SocialLink[] = [
  { name: "Twitter", href: "https://twitter.com/P1tkanen3", icon: "twitter" },
  { name: "Facebook", href: "https://www.facebook.com/tuksu00/", icon: "facebook" },
  { name: "Instagram", href: "https://www.instagram.com/tuukkaaleksi/", icon: "instagram" },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/tuukka-pitk%C3%A4nen-768009265/",
    icon: "linkedin",
  },
  { name: "GitHub", href: "https://github.com/Tuukkaleksi/", icon: "github" },
  { name: "SoundCloud", href: "https://soundcloud.com/tjxkpulse/", icon: "soundcloud" },
];

export const skills: Skill[] = [
  { name: "HTML", level: 85 },
  { name: "CSS", level: 70 },
  { name: "C++", level: 45 },
  { name: "Java", level: 40 },
  { name: "JavaScript", level: 65 },
  { name: "TypeScript", level: 55 },
  { name: "React", level: 50 },
  { name: "WordPress / CMS", level: 70 },
  { name: "Photoshop", level: 55 },
];

export const aboutFacts = [
  { label: "Syntymävuosi", value: "2000" },
  { label: "Kaupunki", value: "Oulu, Suomi" },
  { label: "Ikä", value: "25" },
  { label: "Tutkinto", value: "Merkonomi — Ohjelmistokehittäjä" },
];

export const aboutParagraphs = [
  "Olen 25-vuotias oululainen, joka suhtautuu ohjelmointiin intohimoisesti. Sosiaalisuuteni ja kuuntelevaisuuteni auttavat minua ymmärtämään ihmisten tarpeita ja kääntämään ne toimiviksi digitaalisiksi ratkaisuiksi.",
  "Olen ahkera tekijä, joka vie projektit päätökseen. Olen itseoppinut ohjelmoija ja olen tehnyt projekteja Reactilla, React Nativella, JavaScriptillä, HTML:llä, CSS:llä ja Java:lla — erityisesti React ja React Native ovat olleet keskiössä.",
  "Vapaa-ajalla kuuntelen musiikkia, pelaan pelejä ja teen omaa musiikkia. Alla yksi kappaleistani SoundCloudista.",
];

export const education: ResumeEntry[] = [
  {
    title: "Liiketalouden perustutkinto",
    period: "2016 — 2018",
    organization: "Kemijärven Ammattikoulu REDU",
  },
  {
    title: "Ohjelmistokehittäjä",
    period: "2022 — Toukokuu 2024",
    organization: "Oulun Ammattikoulu OSAO",
    description: "Keskiarvo: 4,59",
  },
  {
    title: "Tieto- ja viestintätekniikka (Insinööri)",
    period: "2024 — Jatkuu",
    organization: "Oulun Ammattikorkeakoulu (OAMK)",
  },
];

export const experience: ResumeEntry[] = [
  {
    title: "Smarket Kemijärvi",
    period: "2017 — 2018",
    details: ["Myyjänä toimiminen", "Asiakaspalvelu", "Hyllyjen täyttö ja siivoaminen"],
  },
  {
    title: "Lidl Kemijärvi",
    period: "2022",
    details: ["Myyjänä toimiminen", "Asiakaspalvelu", "Hyllyjen täyttö ja siivoaminen"],
  },
  {
    title: "Asiakasprojekti — Nettisivusto",
    period: "Marraskuu 2023 — Joulukuu 2023",
    details: [
      "Suunnitelma nettisivustosta",
      "WordPressin käyttö ja toteutus",
      "Erilliset CSS-tiedostot",
      "Logon suunnittelu ja toteutus",
    ],
  },
  {
    title: "Talvea",
    period: "Syyskuu 2023 — Jatkuu",
    details: [
      "Kehitysprojektin jatkokehitys",
      "TypeScript / API",
      "Rajapintoja",
      "Suunnitelmia ja toteutuksia",
      "OpenAI",
    ],
  },
];

export const profileSummary =
  "25-vuotias Kemijärveltä kotoisin, armeija käytynä. Koulutukseltaan merkonomi. Vahvuuksina itseoppiminen, ahkeruus ja sosiaalisuus ryhmäprojekteissa. Kiinnostunut pelien ja verkkosivujen toteutuksesta.";

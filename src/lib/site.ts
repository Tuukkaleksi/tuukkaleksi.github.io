export const siteConfig = {
  name: "Tuukka Pitkänen",
  title: "Tuukka Pitkänen — Portfolio",
  description:
    "Tuukka Pitkäsen portfolio: web-kehitys, React, ohjelmointiprojektit ja yhteistyöhön liittyvät tiedot.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfoliobytuukka.net",
  locale: "fi",
  location: "Oulu, Suomi",
  typedRoles: ["Innokas", "Suunnittelija", "Ohjelmoija"],
} as const;

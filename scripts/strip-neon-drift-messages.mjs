import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const neonDriftEn = {
  title: "Neon Drift",
  subtitle: "Browser survival arcade",
  descriptionTitle: "About",
  description:
    "Neon Drift is a standalone browser survival shooter: dodge swarms from every direction, stack upgrades and synergies, and push for a spot on the global board. It started as a hidden portfolio experiment and now runs as its own app.",
  meta: [
    { label: "Category", value: "Browser arcade" },
    { label: "Stack", value: "TypeScript · Canvas 2D · Next.js · Neon Postgres" },
    { label: "Play", value: "Open Neon Drift" },
  ],
};

const neonDriftFi = {
  title: "Neon Drift",
  subtitle: "Selainpohjainen survival-arcade",
  descriptionTitle: "Kuvaus",
  description:
    "Neon Drift on erillinen selainpeli: väistä parvia joka suunnasta, rakenna synergioita ja kilpaile globaalilla tulostaululla. Alun perin piilotettu portfolio-kokeilu, nyt oma sovellus.",
  meta: [
    { label: "Kategoria", value: "Selainarcade" },
    { label: "Teknologia", value: "TypeScript · Canvas 2D · Next.js · Neon Postgres" },
    { label: "Pelaa", value: "Avaa Neon Drift" },
  ],
};

for (const [locale, nd] of [
  ["en", neonDriftEn],
  ["fi", neonDriftFi],
]) {
  const file = path.join(root, "messages", `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  delete data.arcade;
  data.projects.items["neon-drift"] = nd;
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log("updated", file);
}

import en from "../../messages/en.json";
import fi from "../../messages/fi.json";
import type { Locale } from "./routing";

export const messagesByLocale = { fi, en } as const satisfies Record<Locale, typeof fi>;

export function getMessagesForLocale(locale: Locale) {
  return messagesByLocale[locale];
}

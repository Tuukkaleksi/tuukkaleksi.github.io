"use client";

import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { ArcadeEasterEgg } from "@/components/arcade/ArcadeEasterEgg";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { defaultTimeZone } from "@/i18n/request";
import type { Locale } from "@/i18n/routing";

type AppProvidersProps = {
  children: React.ReactNode;
  locale: Locale;
  messages: AbstractIntlMessages;
};

export function AppProviders({ children, locale, messages }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone={defaultTimeZone}>
        {children}
        <ArcadeEasterEgg />
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}

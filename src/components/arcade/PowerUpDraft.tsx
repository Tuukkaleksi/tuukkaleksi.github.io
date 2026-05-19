"use client";

import { useTranslations } from "next-intl";
import type { PowerUpId } from "@/lib/arcade/power-ups";

type PowerUpDraftProps = {
  choices: PowerUpId[];
  onPick: (index: number) => void;
};

export function PowerUpDraft({ choices, onPick }: PowerUpDraftProps) {
  const t = useTranslations("arcade.powerUps");

  return (
    <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#0a0b0f]/92 px-4">
      <p className="font-display text-xl font-bold tracking-wide text-fuchsia-200 sm:text-2xl">
        {t("draftTitle")}
      </p>
      <p className="text-xs text-white/50">{t("draftHint")}</p>
      <div className="grid w-full max-w-lg gap-3 sm:grid-cols-3">
        {choices.map((id, i) => (
          <button
            key={`${id}-${i}`}
            type="button"
            onClick={() => onPick(i)}
            className="rounded-xl border border-primary/40 bg-white/5 px-3 py-4 text-center transition hover:border-primary hover:bg-primary/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="font-display text-sm font-semibold text-white">{t(id)}</span>
            <span className="mt-1 block text-[10px] text-white/45">{t(`${id}Desc`)}</span>
            <span className="mt-2 inline-block rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
              {i + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

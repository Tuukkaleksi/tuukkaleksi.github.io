"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const SOUNDCLOUD_EMBED =
  "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2169952617&color=%230563bb&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true";

export function SoundCloudEmbed() {
  const t = useTranslations("about");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-[166px] w-full animate-pulse bg-surface-muted"
        aria-hidden
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <iframe
        title={t("soundcloudTitle")}
        src={SOUNDCLOUD_EMBED}
        className="h-[166px] w-full border-0"
        loading="lazy"
        allow="autoplay"
      />
      <p className="border-t border-border bg-surface-muted px-3 py-2 text-xs text-secondary">
        <a
          href="https://soundcloud.com/tjxkpulse"
          target="_blank"
          rel="noopener noreferrer"
          className="prose-link"
        >
          TJXKPULSE
        </a>
        {" · "}
        <a
          href="https://soundcloud.com/tjxkpulse/fin-de-semana"
          target="_blank"
          rel="noopener noreferrer"
          className="prose-link"
        >
          FIN DE SEMANA
        </a>
      </p>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { Gamepad2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

const NeonDriftCanvas = dynamic(
  () => import("@/components/arcade/NeonDriftCanvas").then((m) => m.NeonDriftCanvas),
  { ssr: false, loading: () => null },
);

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function ArcadeEasterEgg() {
  const t = useTranslations("arcade");
  const [open, setOpen] = useState(false);

  const openGame = useCallback(() => setOpen(true), []);
  const closeGame = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        openGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openGame]);

  return (
    <>
      <button
        type="button"
        onClick={openGame}
        className="arcade-trigger group fixed bottom-5 left-5 z-40 flex h-9 w-9 items-center justify-center rounded-md border border-primary/15 bg-surface/40 text-primary/40 backdrop-blur-sm transition hover:border-primary/50 hover:bg-surface/70 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:left-24 xl:left-28"
        aria-label={t("triggerLabel")}
        title={t("shortcutHint")}
      >
        <Gamepad2
          className="arcade-trigger-icon h-4 w-4 shrink-0"
          strokeWidth={1.75}
          aria-hidden
        />
        <span className="sr-only">{t("trigger")}</span>
      </button>

      {open && (
        <div
          className="dark fixed inset-0 z-[100] bg-[#0a0b0d]"
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
        >
          <NeonDriftCanvas active={open} onClose={closeGame} />
        </div>
      )}
    </>
  );
}

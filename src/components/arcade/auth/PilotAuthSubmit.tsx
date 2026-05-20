"use client";

import { Loader2 } from "lucide-react";

type PilotAuthSubmitProps = {
  label: string;
  loading?: boolean;
  disabled?: boolean;
};

export function PilotAuthSubmit({ label, loading, disabled }: PilotAuthSubmitProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-[#0563bb] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_32px_-8px_rgba(59,158,255,0.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {label}
    </button>
  );
}

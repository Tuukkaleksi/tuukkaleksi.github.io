"use client";

import { useId } from "react";

type PilotAuthFieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
  disabled?: boolean;
  endAdornment?: React.ReactNode;
};

export function PilotAuthField({
  label,
  name,
  type = "text",
  autoComplete,
  value,
  onChange,
  error,
  hint,
  disabled,
  endAdornment,
}: PilotAuthFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={[error ? errorId : null, hintId].filter(Boolean).join(" ") || undefined}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-sky-400/45 focus:ring-2 focus:ring-sky-400/15 disabled:opacity-50"
        />
        {endAdornment ? (
          <div className="pointer-events-auto absolute inset-y-0 right-2 flex items-center">{endAdornment}</div>
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className="text-xs text-white/35">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-rose-300/90">
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

type NeonDriftArtProps = {
  variant?: "card" | "hero";
  className?: string;
};

/** Lightweight CSS art — no canvas, no blur filters. */
export function NeonDriftArt({ variant = "card", className = "" }: NeonDriftArtProps) {
  const hero = variant === "hero";

  return (
    <div
      className={`neon-drift-art relative overflow-hidden bg-[#07080c] ${hero ? "min-h-[280px] sm:min-h-[360px]" : "h-full w-full"} ${className}`}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(26,74,122,0.45),transparent_62%)]" />
      <div className="neon-drift-grid pointer-events-none absolute inset-0 opacity-[0.22]" />
      <div className="neon-drift-ring pointer-events-none absolute left-1/2 top-[42%] h-[min(52vw,220px)] w-[min(52vw,220px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25" />
      <div className="neon-drift-ring-slow pointer-events-none absolute left-1/2 top-[42%] h-[min(36vw,150px)] w-[min(36vw,150px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400/15" />
      <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
        <div
          className={`neon-drift-ship bg-gradient-to-br from-sky-300 to-primary ${hero ? "h-16 w-10 sm:h-20 sm:w-12" : "h-12 w-8"}`}
        />
      </div>
      {hero && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07080c] to-transparent" />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center">
        <span
          className={`font-display font-semibold tracking-[0.32em] text-sky-300/80 ${hero ? "text-xs sm:text-sm" : "text-[10px]"}`}
        >
          NEON DRIFT
        </span>
      </div>
    </div>
  );
}

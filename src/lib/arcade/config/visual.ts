export type VisualQuality = "auto" | "high" | "medium" | "low" | "off";

export const VISUAL_QUALITY_KEY = "neon-drift-visual-quality";

const PIXEL_BUDGET_LOW = 720 * 1280;
const PIXEL_BUDGET_MEDIUM = 1080 * 1920;

export function loadVisualQuality(): VisualQuality {
  if (typeof window === "undefined") return "auto";
  const saved = localStorage.getItem(VISUAL_QUALITY_KEY);
  if (
    saved === "auto" ||
    saved === "high" ||
    saved === "medium" ||
    saved === "low" ||
    saved === "off"
  ) {
    return saved;
  }
  return "auto";
}

export function saveVisualQuality(q: VisualQuality) {
  localStorage.setItem(VISUAL_QUALITY_KEY, q);
}

/** Resolved quality used by the renderer (never "auto"). */
export function resolveVisualQuality(
  setting: VisualQuality,
  width: number,
  height: number,
  dpr: number,
): Exclude<VisualQuality, "auto"> {
  if (setting !== "auto") return setting;
  const pixels = width * height * dpr * dpr;
  if (pixels > PIXEL_BUDGET_MEDIUM) return "low";
  if (pixels > PIXEL_BUDGET_LOW) return "medium";
  return "medium";
}

/** Bloom downscale factor per tier (smaller = faster, softer glow). */
export function bloomScale(tier: Exclude<VisualQuality, "auto" | "off">): number {
  switch (tier) {
    case "high":
      return 0.28;
    case "medium":
      return 0.22;
    case "low":
      return 0.16;
  }
}

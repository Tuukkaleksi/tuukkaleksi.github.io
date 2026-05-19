/** Cached gradients — rebuilt on resize only. */
export type BgGradientCache = {
  w: number;
  h: number;
  vignette: CanvasGradient;
  streak: CanvasGradient;
};

export function createBgCache(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): BgGradientCache {
  const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.12, w / 2, h / 2, w * 0.75);
  vignette.addColorStop(0, "rgba(59, 158, 255, 0.05)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");

  const streak = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.55);
  streak.addColorStop(0, "rgba(120, 180, 255, 0.06)");
  streak.addColorStop(1, "rgba(0,0,0,0)");

  return { w, h, vignette, streak };
}

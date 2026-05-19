import type { VisualQuality } from "@/lib/arcade/config/visual";
import { bloomScale } from "@/lib/arcade/config/visual";

/**
 * Fast bloom: downscale + browser filtering — no getImageData (stack blur was too slow).
 */
export class BloomPass {
  private scene: HTMLCanvasElement;
  private sceneCtx: CanvasRenderingContext2D;
  private bloom: HTMLCanvasElement;
  private bloomCtx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private tier: Exclude<VisualQuality, "auto" | "off"> = "medium";

  constructor() {
    this.scene = document.createElement("canvas");
    const sctx = this.scene.getContext("2d", { alpha: true });
    if (!sctx) throw new Error("Bloom scene ctx");
    this.sceneCtx = sctx;

    this.bloom = document.createElement("canvas");
    const bctx = this.bloom.getContext("2d", { alpha: true });
    if (!bctx) throw new Error("Bloom blur ctx");
    this.bloomCtx = bctx;
    this.bloomCtx.imageSmoothingEnabled = true;
    this.bloomCtx.imageSmoothingQuality = "low";
  }

  setTier(tier: Exclude<VisualQuality, "auto" | "off">) {
    this.tier = tier;
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.scene.width = w;
    this.scene.height = h;
    const s = bloomScale(this.tier);
    this.bloom.width = Math.max(1, Math.floor(w * s));
    this.bloom.height = Math.max(1, Math.floor(h * s));
  }

  getSceneCtx() {
    return this.sceneCtx;
  }

  getSceneCanvas() {
    return this.scene;
  }

  /** When off, caller draws straight to `target` and skips this. */
  composite(
    target: CanvasRenderingContext2D,
    intensity: number,
    hidden: boolean,
  ) {
    target.drawImage(this.scene, 0, 0, this.w, this.h);

    if (hidden || intensity <= 0.02) return;

    const bw = this.bloom.width;
    const bh = this.bloom.height;
    this.bloomCtx.clearRect(0, 0, bw, bh);
    this.bloomCtx.drawImage(this.scene, 0, 0, bw, bh);

    if (this.tier === "high") {
      this.bloomCtx.drawImage(this.bloom, 0, 0, bw, bh);
    }

    target.save();
    target.imageSmoothingEnabled = true;
    target.imageSmoothingQuality = this.tier === "high" ? "medium" : "low";
    target.globalCompositeOperation = "lighter";
    target.globalAlpha = intensity * (this.tier === "low" ? 0.32 : 0.42);
    target.drawImage(this.bloom, 0, 0, this.w, this.h);
    target.restore();
  }
}

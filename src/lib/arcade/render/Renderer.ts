import {
  loadVisualQuality,
  resolveVisualQuality,
  type VisualQuality,
} from "@/lib/arcade/config/visual";
import type { GameWorld } from "@/lib/arcade/game/world";
import { createBgCache, type BgGradientCache } from "@/lib/arcade/render/bg-cache";
import { drawBackground, decayShake, getShakeOffset } from "@/lib/arcade/render/drawBackground";
import { drawChromaticShip, drawShip } from "@/lib/arcade/render/drawShip";
import { drawOverlays, drawWorldLayer } from "@/lib/arcade/render/drawWorld";
import { BloomPass } from "@/lib/arcade/render/postfx/bloom";
import { parseColor } from "@/lib/arcade/utils/color";

export class Renderer {
  private bloom = new BloomPass();
  private documentHidden = false;
  private qualitySetting: VisualQuality = "auto";
  private resolvedQuality: Exclude<VisualQuality, "auto"> = "medium";
  private bgCache: BgGradientCache | null = null;
  private dpr = 1;

  constructor() {
    this.qualitySetting = loadVisualQuality();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        this.documentHidden = document.hidden;
      });
    }
  }

  setQuality(setting: VisualQuality) {
    this.qualitySetting = setting;
  }

  getQuality() {
    return this.qualitySetting;
  }

  getResolvedQuality() {
    return this.resolvedQuality;
  }

  resize(world: GameWorld, dpr = 1) {
    this.dpr = dpr;
    this.resolvedQuality = resolveVisualQuality(
      this.qualitySetting,
      world.w,
      world.h,
      dpr,
    );
    if (this.resolvedQuality !== "off") {
      this.bloom.setTier(this.resolvedQuality);
      this.bloom.resize(world.w, world.h);
    }
    const cacheCtx = this.bloom.getSceneCtx();
    this.bgCache = createBgCache(cacheCtx, world.w, world.h);
  }

  private drawScene(
    ctx: CanvasRenderingContext2D,
    world: GameWorld,
    dt: number,
  ) {
    decayShake(world, dt);
    const shake = getShakeOffset(world);
    const pulse = world.beat.pulse();
    const bass = world.audio.getBassEnergy();
    const playing =
      world.phase === "playing" || world.phase === "bossFight" || world.phase === "bossIntro";
    const showWorld =
      playing || world.phase === "paused" || world.phase === "gameover";

    const primary = parseColor(world.colors.primary, "#0563bb");
    const fg = parseColor(world.colors.foreground, "#e8eaed");

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, world.w, world.h);
    ctx.save();
    ctx.translate(shake.x, shake.y);

    drawBackground(ctx, world, pulse, playing, this.bgCache);
    drawWorldLayer(ctx, world, primary, fg, bass, showWorld);

    const shipVisible = showWorld;
    if (world.chroma > 0.05 && showWorld) {
      drawChromaticShip(ctx, world, primary, fg, shipVisible);
    } else {
      drawShip(ctx, world, primary, fg, world.phase, shipVisible);
    }

    drawOverlays(ctx, world, primary, fg, showWorld, playing);
    ctx.restore();

    const bloomIntensity =
      this.resolvedQuality === "off" ? 0 : 0.28 + pulse * 0.2 + bass * 0.12;
    return bloomIntensity;
  }

  /** Draw frame; composites to `target` when bloom is enabled. */
  draw(world: GameWorld, dt: number, target: CanvasRenderingContext2D) {
    if (this.resolvedQuality === "off") {
      const intensity = this.drawScene(target, world, dt);
      return intensity;
    }

    const scene = this.bloom.getSceneCtx();
    const intensity = this.drawScene(scene, world, dt);
    if (this.documentHidden) {
      target.drawImage(this.bloom.getSceneCanvas(), 0, 0, world.w, world.h);
    } else {
      this.bloom.composite(target, intensity, false);
    }
    return intensity;
  }
}

import {
  loadVisualQuality,
  resolveVisualQuality,
  type VisualQuality,
} from "@/lib/arcade/config/visual";
import type { GameWorld } from "@/lib/arcade/game/world";
import { createBgCache, type BgGradientCache } from "@/lib/arcade/render/bg-cache";
import { drawBackground, decayShake, getShakeOffset } from "@/lib/arcade/render/drawBackground";
import { drawMenuScene } from "@/lib/arcade/render/drawMenu";
import { drawChromaticShip, drawShip } from "@/lib/arcade/render/drawShip";
import { drawOverlays, drawWorldLayer } from "@/lib/arcade/render/drawWorld";
import { BloomPass } from "@/lib/arcade/render/postfx/bloom";
import { parseColor } from "@/lib/arcade/utils/color";
import type { GamePhase } from "@/lib/arcade/types";

export type DrawProfile = "full" | "menu" | "snapshot";

function profileForPhase(phase: GamePhase): DrawProfile {
  if (phase === "ready") return "menu";
  if (phase === "draft" || phase === "paused" || phase === "gameover") return "snapshot";
  return "full";
}

export class Renderer {
  private bloom = new BloomPass();
  private documentHidden = false;
  private qualitySetting: VisualQuality = "auto";
  private resolvedQuality: Exclude<VisualQuality, "auto"> = "medium";
  private bgCache: BgGradientCache | null = null;
  private readonly onVisibilityChange = () => {
    this.documentHidden = document.hidden;
  };

  constructor() {
    this.qualitySetting = loadVisualQuality();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onVisibilityChange);
    }
  }

  destroy() {
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }
    this.bgCache = null;
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
    const cacheCtx =
      this.resolvedQuality === "off"
        ? null
        : this.bloom.getSceneCtx();
    if (cacheCtx) this.bgCache = createBgCache(cacheCtx, world.w, world.h);
    else {
      const tmp = document.createElement("canvas").getContext("2d");
      if (tmp) this.bgCache = createBgCache(tmp, world.w, world.h);
    }
  }

  getProfile(phase: GamePhase) {
    return profileForPhase(phase);
  }

  private drawFullScene(ctx: CanvasRenderingContext2D, world: GameWorld, dt: number) {
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

    const berserk = world.powers.isBerserk() ? 1 : 0;
    return this.resolvedQuality === "off"
      ? 0
      : 0.28 + pulse * 0.2 + bass * 0.12 + berserk * 0.14;
  }

  /**
   * @param profile `snapshot` = one gameplay frame (draft/pause overlay). `menu` = static cheap UI bg.
   */
  draw(
    world: GameWorld,
    dt: number,
    target: CanvasRenderingContext2D,
    profile: DrawProfile = "full",
  ) {
    if (this.documentHidden && profile !== "menu") return;

    if (profile === "menu") {
      drawMenuScene(target, world, this.bgCache);
      return;
    }

    const useBloom = this.resolvedQuality !== "off" && profile === "full";

    if (!useBloom) {
      this.drawFullScene(target, world, dt);
      return;
    }

    const scene = this.bloom.getSceneCtx();
    const intensity = this.drawFullScene(scene, world, dt);
    this.bloom.composite(target, intensity, false);
  }
}

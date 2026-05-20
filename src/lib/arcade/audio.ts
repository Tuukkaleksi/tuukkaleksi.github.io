/** BPM for drift-main-music-2 — tune if the track differs. */
export const RUN_BPM = 128;

const MENU_MUSIC_URL = "/sound/neon-main-menu-song.mp3";
/** Run set: intro once, then loop for the rest of the run. */
const RUN_MUSIC_INTRO_URL = "/sound/drift-main-music-2.mp3";
const RUN_MUSIC_LOOP_URL = "/sound/drift-main-music.mp3";
const PLACEHOLDER_SHOOT = "/sound/placeholder-shoot.mp3";
const PLACEHOLDER_EXPLOSION = "/sound/placeholder-explosion.mp3";
const MUSIC_VOLUME_KEY = "neon-drift-music-vol";

type MusicMode = "menu" | "run" | "none";

let sharedMenuEl: HTMLAudioElement | null = null;
let sharedRunIntroEl: HTMLAudioElement | null = null;
let sharedRunLoopEl: HTMLAudioElement | null = null;

/** Shared context for SFX only — run music stays on plain <audio> for reliable playback. */
let sharedCtx: AudioContext | null = null;
let sharedMaster: GainNode | null = null;

let arcadeAudioSingleton: ArcadeAudio | null = null;

function createTrack(url: string, loop = true) {
  const track = new Audio(url);
  track.loop = loop;
  track.preload = "auto";
  track.setAttribute("playsinline", "");
  return track;
}

function getMenuEl() {
  if (typeof window === "undefined") return null;
  if (!sharedMenuEl) sharedMenuEl = createTrack(MENU_MUSIC_URL);
  return sharedMenuEl;
}

function getRunIntroEl() {
  if (typeof window === "undefined") return null;
  if (!sharedRunIntroEl) sharedRunIntroEl = createTrack(RUN_MUSIC_INTRO_URL, false);
  return sharedRunIntroEl;
}

function getRunLoopEl() {
  if (typeof window === "undefined") return null;
  if (!sharedRunLoopEl) sharedRunLoopEl = createTrack(RUN_MUSIC_LOOP_URL, true);
  return sharedRunLoopEl;
}

function getSharedContext() {
  if (typeof window === "undefined") return null;
  if (sharedCtx) return sharedCtx;
  const Ctx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  sharedCtx = new Ctx();
  sharedMaster = sharedCtx.createGain();
  sharedMaster.gain.value = 0.38;
  sharedMaster.connect(sharedCtx.destination);
  return sharedCtx;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function getArcadeAudio() {
  if (!arcadeAudioSingleton) arcadeAudioSingleton = new ArcadeAudio();
  return arcadeAudioSingleton;
}

export function shutdownArcadeAudio() {
  arcadeAudioSingleton?.shutdown();
  arcadeAudioSingleton = null;
}

export class ArcadeAudio {
  private muted = false;
  private musicVolume = 0.28;
  private shutdownRequested = false;
  private pendingTimers: number[] = [];

  private menuEl: HTMLAudioElement | null = null;
  /** Currently audible run track (intro, then loop). */
  private runEl: HTMLAudioElement | null = null;
  private runIntroEl: HTMLAudioElement | null = null;
  private runLoopEl: HTMLAudioElement | null = null;
  private runIntroDuration = 0;
  private runOnLoop = false;
  private mode: MusicMode = "none";

  private readonly onRunIntroEnded = () => {
    void this.playRunLoopSection();
  };

  private sfxBuffers = new Map<string, AudioBuffer>();
  private nearMissCd = 0;
  private bassEnvelope = 0;
  private sfxGainMul = 1;

  private scheduleTone(fn: () => void, delayMs: number) {
    const id = window.setTimeout(() => {
      this.pendingTimers = this.pendingTimers.filter((t) => t !== id);
      if (!this.shutdownRequested) fn();
    }, delayMs);
    this.pendingTimers.push(id);
  }

  constructor() {
    this.shutdownRequested = false;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(MUSIC_VOLUME_KEY);
      if (saved != null) this.musicVolume = clamp(Number(saved), 0, 1);
    }
  }

  getRunBpm() {
    return RUN_BPM;
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  getMusicTime() {
    if (this.mode !== "run") return 0;
    if (this.runOnLoop && this.runLoopEl) {
      return this.runIntroDuration + this.runLoopEl.currentTime;
    }
    return this.runIntroEl?.currentTime ?? this.runLoopEl?.currentTime ?? 0;
  }

  setMusicVolume(v: number) {
    this.musicVolume = clamp(v, 0, 1);
    localStorage.setItem(MUSIC_VOLUME_KEY, String(this.musicVolume));
    this.applyMusicVolume();
  }

  private applyMusicVolume() {
    const vol = this.muted ? 0 : this.musicVolume;
    if (this.menuEl) this.menuEl.volume = this.mode === "menu" ? vol : 0;
    const runVol = this.mode === "run" ? vol : 0;
    if (this.runIntroEl) this.runIntroEl.volume = runVol;
    if (this.runLoopEl) this.runLoopEl.volume = runVol;
  }

  private detachRunHandlers() {
    this.runIntroEl?.removeEventListener("ended", this.onRunIntroEnded);
  }

  private pauseRunTracks() {
    this.runIntroEl?.pause();
    this.runLoopEl?.pause();
  }

  private rememberIntroDuration(intro: HTMLAudioElement) {
    if (Number.isFinite(intro.duration) && intro.duration > 0) {
      this.runIntroDuration = intro.duration;
      return;
    }
    const onMeta = () => {
      if (Number.isFinite(intro.duration) && intro.duration > 0) {
        this.runIntroDuration = intro.duration;
      }
      intro.removeEventListener("loadedmetadata", onMeta);
    };
    intro.addEventListener("loadedmetadata", onMeta);
  }

  private ensureSfx() {
    const ctx = getSharedContext();
    if (!ctx || !sharedMaster) return null;
    void this.preloadPlaceholders();
    return ctx;
  }

  private async preloadPlaceholders() {
    const ctx = getSharedContext();
    if (!ctx) return;
    await Promise.all([
      this.loadSample(PLACEHOLDER_SHOOT, "shoot"),
      this.loadSample(PLACEHOLDER_EXPLOSION, "explosion"),
    ]);
  }

  private async loadSample(url: string, key: string) {
    const ctx = getSharedContext();
    if (!ctx) return;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const buf = await res.arrayBuffer();
      this.sfxBuffers.set(key, await ctx.decodeAudioData(buf));
    } catch {
      /* synth fallback */
    }
  }

  preloadMusic() {
    const menu = getMenuEl();
    const intro = getRunIntroEl();
    const loop = getRunLoopEl();
    this.menuEl = menu;
    this.runIntroEl = intro;
    this.runLoopEl = loop;
    if (menu?.networkState === HTMLMediaElement.NETWORK_EMPTY) menu.load();
    if (intro?.networkState === HTMLMediaElement.NETWORK_EMPTY) intro.load();
    if (loop?.networkState === HTMLMediaElement.NETWORK_EMPTY) loop.load();
  }

  /** Canvas unmount — keep hub music, only leave run mode. */
  releaseFromGame() {
    this.detachRunHandlers();
    this.pauseRunTracks();
    this.runOnLoop = false;
    if (this.runIntroEl) this.runIntroEl.currentTime = 0;
    if (this.mode === "run") this.mode = "none";
    void this.playMenuMusic();
  }

  /** Leaving all /neon-drift routes — pause without resetting playback position. */
  leaveNeonDriftHub() {
    this.detachRunHandlers();
    this.menuEl?.pause();
    this.pauseRunTracks();
    this.runOnLoop = false;
    this.mode = "none";
    this.applyMusicVolume();
  }

  /** Full teardown when Neon Drift layout unmounts. */
  shutdown() {
    this.shutdownRequested = true;
    for (const id of this.pendingTimers) window.clearTimeout(id);
    this.pendingTimers = [];
    this.leaveNeonDriftHub();
    this.detachRunHandlers();
    this.menuEl = null;
    this.runEl = null;
    this.runIntroEl = null;
    this.runLoopEl = null;
    this.sfxBuffers.clear();
    if (sharedCtx) {
      void sharedCtx.close().catch(() => {});
      sharedCtx = null;
      sharedMaster = null;
    }
    sharedMenuEl = null;
    sharedRunIntroEl = null;
    sharedRunLoopEl = null;
  }

  /** @deprecated Canvas cleanup — use releaseFromGame instead. */
  dispose() {
    this.releaseFromGame();
  }

  async resume() {
    const ctx = getSharedContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        /* needs gesture */
      }
    }
    this.menuEl = getMenuEl();
    this.runIntroEl = getRunIntroEl();
    this.runLoopEl = getRunLoopEl();
    this.applyMusicVolume();
  }

  private waitForMusicReady(track: HTMLAudioElement) {
    if (track.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const done = () => {
        track.removeEventListener("canplaythrough", done);
        track.removeEventListener("error", onErr);
        resolve();
      };
      const onErr = () => {
        track.removeEventListener("canplaythrough", done);
        track.removeEventListener("error", onErr);
        reject(new Error("music load failed"));
      };
      track.addEventListener("canplaythrough", done, { once: true });
      track.addEventListener("error", onErr, { once: true });
      if (track.networkState === HTMLMediaElement.NETWORK_EMPTY) track.load();
    });
  }

  private async playTrack(track: HTMLAudioElement, url: string, mode: MusicMode) {
    if (this.mode === mode && !track.paused) return;

    const switching = this.mode !== mode;
    this.mode = mode;
    this.applyMusicVolume();

    try {
      await this.waitForMusicReady(track);
    } catch {
      console.warn("[Neon Drift] Could not load music:", url);
      return;
    }

    await this.resume();

    try {
      if (switching || track.paused) await track.play();
    } catch (err) {
      console.warn("[Neon Drift] Music playback blocked.", err);
    }
  }

  async playMenuMusic() {
    const track = getMenuEl();
    if (!track) return;
    this.menuEl = track;
    if (this.mode === "menu" && !track.paused) return;
    this.detachRunHandlers();
    this.pauseRunTracks();
    this.runOnLoop = false;
    await this.playTrack(track, MENU_MUSIC_URL, "menu");
  }

  private async playRunLoopSection() {
    const loop = this.runLoopEl ?? getRunLoopEl();
    if (!loop || this.mode !== "run" || this.shutdownRequested) return;

    this.runIntroEl?.pause();
    this.runOnLoop = true;
    this.runEl = loop;
    this.runLoopEl = loop;

    try {
      await this.waitForMusicReady(loop);
    } catch {
      console.warn("[Neon Drift] Could not load run loop:", RUN_MUSIC_LOOP_URL);
      return;
    }

    await this.resume();
    loop.currentTime = 0;
    this.applyMusicVolume();

    try {
      await loop.play();
    } catch (err) {
      console.warn("[Neon Drift] Run loop playback blocked.", err);
    }
  }

  async playRunMusic() {
    const intro = getRunIntroEl();
    const loop = getRunLoopEl();
    if (!intro) return;

    this.detachRunHandlers();
    this.runIntroEl = intro;
    this.runLoopEl = loop;
    this.runOnLoop = false;
    this.runEl = intro;

    this.menuEl?.pause();
    if (this.menuEl) this.menuEl.volume = 0;
    loop?.pause();
    if (loop) loop.currentTime = 0;
    intro.currentTime = 0;

    this.mode = "run";
    this.applyMusicVolume();

    try {
      await this.waitForMusicReady(intro);
      if (loop) await this.waitForMusicReady(loop);
    } catch {
      console.warn("[Neon Drift] Could not load run intro:", RUN_MUSIC_INTRO_URL);
      return;
    }

    this.rememberIntroDuration(intro);
    await this.resume();

    intro.addEventListener("ended", this.onRunIntroEnded);

    try {
      await intro.play();
    } catch (err) {
      console.warn("[Neon Drift] Run intro playback blocked.", err);
    }
  }

  async playMusic() {
    return this.playRunMusic();
  }

  pauseRunMusic() {
    this.pauseRunTracks();
  }

  pauseMusic() {
    this.pauseRunMusic();
  }

  stopRunMusic() {
    this.detachRunHandlers();
    this.pauseRunTracks();
    if (this.runIntroEl) {
      this.runIntroEl.currentTime = 0;
      this.runIntroEl.playbackRate = 1;
    }
    if (this.runLoopEl) {
      this.runLoopEl.currentTime = 0;
      this.runLoopEl.playbackRate = 1;
    }
    this.runOnLoop = false;
    if (this.mode === "run") this.mode = "none";
    this.applyMusicVolume();
  }

  stopAllMusic() {
    this.menuEl?.pause();
    this.stopRunMusic();
    this.mode = "none";
    this.applyMusicVolume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (sharedMaster) sharedMaster.gain.value = m ? 0 : 0.38 * this.sfxGainMul;
    this.applyMusicVolume();
  }

  isMuted() {
    return this.muted;
  }

  private syntheticBass(): number {
    const t =
      this.mode === "run" && this.runEl
        ? this.runEl.currentTime
        : performance.now() / 1000;
    const phase = (t * (RUN_BPM / 60)) % 1;
    return 0.22 + 0.5 * Math.max(0, 1 - phase * 3);
  }

  getBassEnergy(): number {
    return this.syntheticBass();
  }

  setMusicIntensity(_tier: number) {
    if (this.runIntroEl) this.runIntroEl.playbackRate = 1;
    if (this.runLoopEl) this.runLoopEl.playbackRate = 1;
  }

  applyDeathLowPass() {
    if (this.mode !== "run") return;
    const duck = (this.muted ? 0 : this.musicVolume) * 0.35;
    if (this.runIntroEl) this.runIntroEl.volume = duck;
    if (this.runLoopEl) this.runLoopEl.volume = duck;
  }

  tick(dt: number) {
    if (this.nearMissCd > 0) this.nearMissCd -= dt;
  }

  nearMiss() {
    if (this.muted || this.nearMissCd > 0) return;
    this.nearMissCd = 0.35;
    this.tone(520, 0.06, "sine", 0.05, 180);
  }

  private playBuffer(key: string, gain = 0.12, rate = 1) {
    const ctx = this.ensureSfx();
    const buf = this.sfxBuffers.get(key);
    if (!ctx || !sharedMaster || !buf) return false;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g);
    g.connect(sharedMaster);
    src.start();
    return true;
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain = 0.12, slide = 0) {
    if (this.shutdownRequested || this.muted) return;
    const ctx = this.ensureSfx();
    if (!ctx || !sharedMaster) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(sharedMaster);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  shoot() {
    if (!this.playBuffer("shoot", 0.22 * this.sfxGainMul)) {
      this.tone(880, 0.04, "square", 0.1 * this.sfxGainMul, -400);
    }
  }

  hit() {
    this.tone(140, 0.1, "sawtooth", 0.12, -80);
  }

  enemyDeath() {
    const bass = this.getBassEnergy();
    if (!this.playBuffer("explosion", (0.26 + bass * 0.08) * this.sfxGainMul, 0.95 + bass * 0.1)) {
      this.tone(320, 0.08, "triangle", 0.14, 200);
    }
  }

  gem() {
    this.tone(660, 0.05, "sine", 0.07, 120);
  }

  powerUp() {
    this.tone(440, 0.12, "sine", 0.09, 300);
  }

  berserkStart() {
    this.sfxGainMul = 1.12;
    if (sharedMaster && !this.muted) sharedMaster.gain.value = 0.38 * this.sfxGainMul;
    this.tone(220, 0.14, "sawtooth", 0.1, 80);
    this.scheduleTone(() => this.tone(440, 0.1, "square", 0.08, 120), 70);
    this.scheduleTone(() => this.tone(880, 0.08, "sine", 0.07, -60), 140);
  }

  damage() {
    this.tone(90, 0.2, "sawtooth", 0.15, -40);
  }

  setOverclock(_on: boolean) {}

  bossDefeated() {
    this.tone(330, 0.08, "sine", 0.12);
    this.scheduleTone(() => this.tone(660, 0.12, "sine", 0.14), 60);
    this.scheduleTone(() => this.tone(990, 0.15, "triangle", 0.1), 140);
  }

  gameOver() {
    this.sfxGainMul = 1;
    if (sharedMaster && !this.muted) sharedMaster.gain.value = 0.38;
    this.applyDeathLowPass();
    this.tone(180, 0.4, "triangle", 0.1, -120);
  }

  start() {
    this.tone(523, 0.1, "sine", 0.09);
    this.scheduleTone(() => this.tone(784, 0.1, "sine", 0.09), 80);
  }
}

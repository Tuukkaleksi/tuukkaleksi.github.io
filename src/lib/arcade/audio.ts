/** BPM for drift-main-music-2 — tune if the track differs. */
export const RUN_BPM = 128;

const MENU_MUSIC_URL = "/sound/neon-main-menu-song.mp3";
const RUN_MUSIC_URL = "/sound/drift-main-music-2.mp3";
const PLACEHOLDER_SHOOT = "/sound/placeholder-shoot.mp3";
const PLACEHOLDER_EXPLOSION = "/sound/placeholder-explosion.mp3";
const MUSIC_VOLUME_KEY = "neon-drift-music-vol";

type MusicMode = "menu" | "run" | "none";

let sharedMenuEl: HTMLAudioElement | null = null;
let sharedRunEl: HTMLAudioElement | null = null;

function createTrack(url: string) {
  const track = new Audio(url);
  track.loop = true;
  track.preload = "auto";
  track.setAttribute("playsinline", "");
  return track;
}

function getMenuEl() {
  if (typeof window === "undefined") return null;
  if (!sharedMenuEl) sharedMenuEl = createTrack(MENU_MUSIC_URL);
  return sharedMenuEl;
}

function getRunEl() {
  if (typeof window === "undefined") return null;
  if (!sharedRunEl) sharedRunEl = createTrack(RUN_MUSIC_URL);
  return sharedRunEl;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export class ArcadeAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private musicVolume = 0.28;
  private disposed = false;
  private pendingTimers: number[] = [];

  private menuEl: HTMLAudioElement | null = null;
  private runEl: HTMLAudioElement | null = null;
  private mode: MusicMode = "none";

  private sfxBuffers = new Map<string, AudioBuffer>();
  private nearMissCd = 0;

  private analyser: AnalyserNode | null = null;
  private analyserData: Uint8Array | null = null;
  private analyserReady = false;
  private bassEnvelope = 0;
  private sfxGainMul = 1;

  private scheduleTone(fn: () => void, delayMs: number) {
    const id = window.setTimeout(() => {
      this.pendingTimers = this.pendingTimers.filter((t) => t !== id);
      if (!this.disposed) fn();
    }, delayMs);
    this.pendingTimers.push(id);
  }

  constructor() {
    this.disposed = false;
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

  /** Playback time for beat sync — run track only. */
  getMusicTime() {
    if (this.mode !== "run" || !this.runEl) return 0;
    return this.runEl.currentTime;
  }

  setMusicVolume(v: number) {
    this.musicVolume = clamp(v, 0, 1);
    localStorage.setItem(MUSIC_VOLUME_KEY, String(this.musicVolume));
    this.applyMusicVolume();
  }

  private activeEl() {
    if (this.mode === "run") return this.runEl;
    if (this.mode === "menu") return this.menuEl;
    return null;
  }

  private applyMusicVolume() {
    const vol = this.muted ? 0 : this.musicVolume;
    if (this.menuEl) this.menuEl.volume = this.mode === "menu" ? vol : 0;
    if (this.runEl) this.runEl.volume = this.mode === "run" ? vol : 0;
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.38;
    this.master.connect(this.ctx.destination);
    void this.preloadPlaceholders();
    return this.ctx;
  }

  private setupRunAnalyser() {
    const ctx = this.ctx;
    const run = this.runEl;
    if (!ctx || !run || this.analyserReady) return;
    try {
      const source = ctx.createMediaElementSource(run);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.82;
      this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);
      source.connect(this.analyser);
      this.analyser.connect(ctx.destination);
      this.analyserReady = true;
    } catch {
      /* element already routed — keep synthetic bass */
    }
  }

  private async preloadPlaceholders() {
    const ctx = this.ctx;
    if (!ctx) return;
    await Promise.all([
      this.loadSample(PLACEHOLDER_SHOOT, "shoot"),
      this.loadSample(PLACEHOLDER_EXPLOSION, "explosion"),
    ]);
  }

  private async loadSample(url: string, key: string) {
    const ctx = this.ctx;
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
    const run = getRunEl();
    this.menuEl = menu;
    this.runEl = run;
    if (menu?.networkState === HTMLMediaElement.NETWORK_EMPTY) menu.load();
    if (run?.networkState === HTMLMediaElement.NETWORK_EMPTY) run.load();
  }

  dispose() {
    this.disposed = true;
    for (const id of this.pendingTimers) window.clearTimeout(id);
    this.pendingTimers = [];
    this.stopAllMusic();
    this.menuEl = null;
    this.runEl = null;
    this.analyser = null;
    this.analyserData = null;
    this.analyserReady = false;
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
      this.master = null;
    }
    this.sfxBuffers.clear();
  }

  async resume() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        /* needs gesture */
      }
    }
    this.menuEl = getMenuEl();
    this.runEl = getRunEl();
    this.setupRunAnalyser();
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
    this.mode = mode;
    this.applyMusicVolume();
    try {
      await this.waitForMusicReady(track);
    } catch {
      console.warn("[Neon Drift] Could not load music:", url);
      return;
    }
    void this.resume();
    try {
      if (track.paused) await track.play();
    } catch (err) {
      console.warn("[Neon Drift] Music playback blocked.", err);
    }
  }

  async playMenuMusic() {
    const track = getMenuEl();
    if (!track) return;
    this.menuEl = track;
    this.runEl?.pause();
    await this.playTrack(track, MENU_MUSIC_URL, "menu");
  }

  async playRunMusic() {
    const track = getRunEl();
    if (!track) return;
    this.runEl = track;
    this.menuEl?.pause();
    await this.playTrack(track, RUN_MUSIC_URL, "run");
  }

  /** @deprecated Use playRunMusic — kept for game loop compatibility. */
  async playMusic() {
    return this.playRunMusic();
  }

  pauseRunMusic() {
    this.runEl?.pause();
  }

  pauseMusic() {
    this.pauseRunMusic();
  }

  stopRunMusic() {
    if (!this.runEl) return;
    this.runEl.pause();
    this.runEl.currentTime = 0;
    this.runEl.playbackRate = 1;
    if (this.mode === "run") this.mode = "none";
    this.applyMusicVolume();
  }

  stopAllMusic() {
    this.menuEl?.pause();
    this.stopRunMusic();
    if (this.menuEl) this.menuEl.currentTime = 0;
    this.mode = "none";
    this.applyMusicVolume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.38 * this.sfxGainMul;
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

  private sampleAnalyserBass(): number {
    const an = this.analyser;
    const data = this.analyserData;
    if (!an || !data || this.mode !== "run") return 0;
    an.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
    const hzPerBin = (this.ctx?.sampleRate ?? 44100) / 2 / data.length;
    const maxBin = Math.min(data.length - 1, Math.floor(220 / hzPerBin));
    let sum = 0;
    for (let i = 0; i <= maxBin; i++) sum += data[i]!;
    const raw = sum / ((maxBin + 1) * 255);
    const target = clamp(raw * 2.2, 0, 1);
    const attack = target > this.bassEnvelope ? 0.45 : 0.12;
    this.bassEnvelope += (target - this.bassEnvelope) * attack;
    return this.bassEnvelope;
  }

  /** 0–1 bass pulse — hybrid analyser + BPM fallback. */
  getBassEnergy(): number {
    const analysed = this.sampleAnalyserBass();
    const synth = this.syntheticBass();
    if (this.mode !== "run") return synth * 0.65;
    return analysed > 0.04 ? analysed * 0.72 + synth * 0.28 : synth;
  }

  setMusicIntensity(_tier: number) {
    if (this.runEl) this.runEl.playbackRate = 1;
  }

  applyDeathLowPass() {
    if (!this.runEl || this.mode !== "run") return;
    this.runEl.volume = (this.muted ? 0 : this.musicVolume) * 0.35;
  }

  tick(dt: number) {
    if (this.nearMissCd > 0) this.nearMissCd -= dt;
    if (this.mode === "run") this.sampleAnalyserBass();
  }

  nearMiss() {
    if (this.muted || this.nearMissCd > 0) return;
    this.nearMissCd = 0.35;
    this.tone(520, 0.06, "sine", 0.05, 180);
  }

  private playBuffer(key: string, gain = 0.12, rate = 1) {
    const ctx = this.ensure();
    const buf = this.sfxBuffers.get(key);
    if (!ctx || !this.master || !buf) return false;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g);
    g.connect(this.master);
    src.start();
    return true;
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain = 0.12, slide = 0) {
    if (this.disposed || this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.master);
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
    if (this.master && !this.muted) this.master.gain.value = 0.38 * this.sfxGainMul;
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
    if (this.master && !this.muted) this.master.gain.value = 0.38;
    this.applyDeathLowPass();
    this.tone(180, 0.4, "triangle", 0.1, -120);
  }

  start() {
    this.tone(523, 0.1, "sine", 0.09);
    this.scheduleTone(() => this.tone(784, 0.1, "sine", 0.09), 80);
  }
}

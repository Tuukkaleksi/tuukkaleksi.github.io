const MUSIC_URL = "/sound/drift-main-music.mp3";
/** Replace with final assets when ready — synth fallback used if missing. */
const PLACEHOLDER_SHOOT = "/sound/placeholder-shoot.mp3";
const PLACEHOLDER_EXPLOSION = "/sound/placeholder-explosion.mp3";
const MUSIC_VOLUME_KEY = "neon-drift-music-vol";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

type MediaElementWithCapture = HTMLAudioElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

export class ArcadeAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private musicVolume = 0.28;
  private overclockDuck = false;

  private musicEl: MediaElementWithCapture | null = null;
  private analyser: AnalyserNode | null = null;
  private freqBuf: Uint8Array<ArrayBuffer> | null = null;
  private analyserWired = false;

  private sfxBuffers = new Map<string, AudioBuffer>();
  private nearMissCd = 0;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(MUSIC_VOLUME_KEY);
      if (saved != null) this.musicVolume = clamp(Number(saved), 0, 1);
    }
  }

  getMusicVolume() {
    return this.musicVolume;
  }

  getMusicTime() {
    return this.musicEl?.currentTime ?? 0;
  }

  setMusicVolume(v: number) {
    this.musicVolume = clamp(v, 0, 1);
    localStorage.setItem(MUSIC_VOLUME_KEY, String(this.musicVolume));
    this.applyMusicVolume();
  }

  private effectiveMusicVolume() {
    const base = this.muted ? 0 : this.musicVolume;
    return this.overclockDuck ? base * 0.72 : base;
  }

  private applyMusicVolume() {
    if (this.musicEl) this.musicEl.volume = this.effectiveMusicVolume();
  }

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.2;
    this.master.connect(this.ctx.destination);
    void this.preloadPlaceholders();
    return this.ctx;
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
      /* placeholder missing — synth fallback */
    }
  }

  /** Call when the arcade opens so the track is ready on Start. */
  preloadMusic() {
    const track = this.ensureMusic();
    if (track.networkState === HTMLMediaElement.NETWORK_EMPTY) track.load();
  }

  private ensureMusic() {
    if (this.musicEl) return this.musicEl;
    const track = new Audio(MUSIC_URL) as MediaElementWithCapture;
    track.loop = true;
    track.preload = "auto";
    track.setAttribute("playsinline", "");
    this.musicEl = track;
    return track;
  }

  /** Tap music for bass analyser without hijacking element output. */
  private wireAnalyser() {
    if (this.analyserWired || !this.musicEl) return;
    const ctx = this.ensure();
    if (!ctx) return;

    const capture = this.musicEl.captureStream ?? this.musicEl.mozCaptureStream;
    if (!capture) return;

    try {
      const stream = capture.call(this.musicEl);
      const src = ctx.createMediaStreamSource(stream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.75;
      this.freqBuf = new Uint8Array(this.analyser.frequencyBinCount);
      src.connect(this.analyser);
      this.analyserWired = true;
    } catch {
      /* analyser optional */
    }
  }

  /** Unlock Web Audio for SFX — call from a user gesture. */
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

  async playMusic() {
    const track = this.ensureMusic();
    this.applyMusicVolume();

    try {
      await this.waitForMusicReady(track);
    } catch {
      console.warn("[Neon Drift] Could not load music:", MUSIC_URL);
      return;
    }

    void this.resume();

    try {
      if (track.paused) await track.play();
      this.wireAnalyser();
    } catch (err) {
      console.warn("[Neon Drift] Music playback blocked — click Start again.", err);
    }
  }

  pauseMusic() {
    this.musicEl?.pause();
  }

  stopMusic() {
    if (!this.musicEl) return;
    this.musicEl.pause();
    this.musicEl.currentTime = 0;
    this.musicEl.playbackRate = 1;
    this.overclockDuck = false;
    this.applyMusicVolume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.2;
    this.applyMusicVolume();
  }

  isMuted() {
    return this.muted;
  }

  /** 0–1 bass energy from music analyser (or beat pulse fallback). */
  getBassEnergy(): number {
    if (this.analyser && this.freqBuf && this.musicEl && !this.musicEl.paused) {
      this.analyser.getByteFrequencyData(this.freqBuf);
      let sum = 0;
      const n = Math.min(10, this.freqBuf.length);
      for (let i = 0; i < n; i++) sum += this.freqBuf[i]!;
      const measured = clamp(sum / (n * 255), 0, 1);
      if (measured > 0.02) return measured;
    }
    const t = this.musicEl?.currentTime ?? 0;
    const phase = (t * (128 / 60)) % 1;
    return 0.25 + 0.45 * Math.max(0, 1 - phase * 3);
  }

  setMusicIntensity(tier: number) {
    if (!this.musicEl) return;
    this.musicEl.playbackRate = clamp(1 + tier * 0.04, 1, 1.2);
  }

  applyDeathLowPass() {
    if (!this.musicEl) return;
    this.musicEl.volume = this.effectiveMusicVolume() * 0.35;
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
    if (this.muted) return;
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
    if (!this.playBuffer("shoot", 0.08)) this.tone(880, 0.04, "square", 0.05, -400);
  }

  hit() {
    this.tone(140, 0.1, "sawtooth", 0.12, -80);
  }

  enemyDeath() {
    const bass = this.getBassEnergy();
    if (!this.playBuffer("explosion", 0.1 + bass * 0.06, 0.95 + bass * 0.1)) {
      this.tone(320, 0.08, "triangle", 0.09, 200);
    }
  }

  gem() {
    this.tone(660, 0.05, "sine", 0.07, 120);
  }

  powerUp() {
    this.tone(440, 0.12, "sine", 0.09, 300);
  }

  damage() {
    this.tone(90, 0.2, "sawtooth", 0.15, -40);
  }

  setOverclock(on: boolean) {
    this.overclockDuck = on;
    this.applyMusicVolume();
  }

  gameOver() {
    this.applyDeathLowPass();
    this.tone(180, 0.4, "triangle", 0.1, -120);
  }

  start() {
    this.tone(523, 0.1, "sine", 0.09);
    setTimeout(() => this.tone(784, 0.1, "sine", 0.09), 80);
  }
}

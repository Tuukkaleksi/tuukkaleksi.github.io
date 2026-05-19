/** Beat clock — prefers music playback time, falls back to wall clock BPM. */
export class BeatClock {
  private readonly bpm: number;
  private musicTime: () => number;

  constructor(bpm = 128, musicTime: () => number = () => 0) {
    this.bpm = bpm;
    this.musicTime = musicTime;
  }

  setMusicTime(fn: () => number) {
    this.musicTime = fn;
  }

  /** 0–1 pulse, peaks on beats (smooth, not stuttery). */
  pulse(): number {
    const phase = this.phase();
    const c = 0.5 + 0.5 * Math.cos(phase * Math.PI * 2);
    return c * c;
  }

  /** True near beat downbeat (spawn window). */
  onBeat(threshold = 0.88): boolean {
    return this.pulse() >= threshold;
  }

  /** Continuous phase 0–1 per beat. */
  phase(): number {
    const t = this.musicTime() > 0 ? this.musicTime() : performance.now() / 1000;
    return (t * (this.bpm / 60)) % 1;
  }

  beatIndex(): number {
    const t = this.musicTime() > 0 ? this.musicTime() : performance.now() / 1000;
    return Math.floor(t * (this.bpm / 60));
  }
}

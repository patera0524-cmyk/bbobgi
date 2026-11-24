/**
 * Winter Theme Background Music (BGM) Synthesizer
 * Pure Web Audio API - Zero external audio files, works offline & in any iframe.
 * Produces a gentle, cozy winter music-box & warm pad medley in an infinite loop.
 */

interface BgmNote {
  freq: number;
  dur: number; // in seconds
  chord?: number[]; // optional warm pad chord frequencies
}

// Note frequencies (Hz)
const N = {
  REST: 0,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, 'F#4': 369.99, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
};

// Gentle winter theme medley: Snowfall Waltz + Silent Night + First Noel motifs
const WINTER_BGM_SEQUENCE: BgmNote[] = [
  // Part 1: Cozy Snowfall Waltz (C Major / A Minor)
  { freq: N.E5, dur: 0.65, chord: [N.C3, N.G3, N.E4] },
  { freq: N.G5, dur: 0.65 },
  { freq: N.C5, dur: 1.30 },
  { freq: N.D5, dur: 0.65, chord: [N.F3, N.A3, N.C4] },
  { freq: N.E5, dur: 0.65 },
  { freq: N.D5, dur: 1.30 },
  { freq: N.C5, dur: 0.65, chord: [N.A3, N.E4, N.A4] },
  { freq: N.B4, dur: 0.65 },
  { freq: N.A4, dur: 1.30 },
  { freq: N.G4, dur: 0.65, chord: [N.G3, N.B3, N.D4] },
  { freq: N.A4, dur: 0.65 },
  { freq: N.B4, dur: 1.30 },

  { freq: N.E5, dur: 0.65, chord: [N.C3, N.G3, N.E4] },
  { freq: N.G5, dur: 0.65 },
  { freq: N.A5, dur: 1.30 },
  { freq: N.G5, dur: 0.65, chord: [N.F3, N.C4, N.A4] },
  { freq: N.F5, dur: 0.65 },
  { freq: N.E5, dur: 1.30 },
  { freq: N.D5, dur: 0.65, chord: [N.G3, N.D4, N.B4] },
  { freq: N.E5, dur: 0.65 },
  { freq: N.D5, dur: 1.30 },
  { freq: N.C5, dur: 1.95, chord: [N.C3, N.G3, N.E4] },
  { freq: N.REST, dur: 0.65 },

  // Part 2: Silent Night gentle celesta motif
  { freq: N.G4, dur: 0.90, chord: [N.C3, N.E3, N.G3] },
  { freq: N.A4, dur: 0.30 },
  { freq: N.G4, dur: 0.60 },
  { freq: N.E4, dur: 1.80 },

  { freq: N.G4, dur: 0.90, chord: [N.C3, N.E3, N.G3] },
  { freq: N.A4, dur: 0.30 },
  { freq: N.G4, dur: 0.60 },
  { freq: N.E4, dur: 1.80 },

  { freq: N.D5, dur: 1.20, chord: [N.G3, N.B3, N.D4] },
  { freq: N.D5, dur: 0.60 },
  { freq: N.B4, dur: 1.80 },

  { freq: N.C5, dur: 1.20, chord: [N.C3, N.E3, N.G3] },
  { freq: N.C5, dur: 0.60 },
  { freq: N.G4, dur: 1.80 },

  { freq: N.A4, dur: 1.20, chord: [N.F3, N.A3, N.C4] },
  { freq: N.A4, dur: 0.60 },
  { freq: N.C5, dur: 0.90 },
  { freq: N.B4, dur: 0.30 },
  { freq: N.A4, dur: 0.60 },

  { freq: N.G4, dur: 0.90, chord: [N.C3, N.E3, N.G3] },
  { freq: N.A4, dur: 0.30 },
  { freq: N.G4, dur: 0.60 },
  { freq: N.E4, dur: 1.80 },

  // Part 3: Peaceful Winter Ending Cadence
  { freq: N.F5, dur: 0.70, chord: [N.F3, N.A3, N.C4] },
  { freq: N.E5, dur: 0.70 },
  { freq: N.D5, dur: 0.70, chord: [N.G3, N.B3, N.D4] },
  { freq: N.B4, dur: 0.70 },
  { freq: N.C5, dur: 2.20, chord: [N.C3, N.E3, N.G3] },
  { freq: N.REST, dur: 0.90 },
];

class WinterBgmPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private timerId: number | null = null;
  private stepIndex = 0;
  private running = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return null;

        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.16, this.ctx.currentTime);

        // Gentle low-pass filter for warm, non-harsh background ambiance
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(2400, this.ctx.currentTime);

        this.filter.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public isRunning(): boolean {
    return this.running;
  }

  public async resumeIfSuspended(): Promise<boolean> {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return false;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      return ctx.state === 'running';
    } catch {
      return false;
    }
  }

  private playBellNote(freq: number, dur: number) {
    try {
      if (!this.ctx || !this.filter || freq <= 0) return;
      const now = this.ctx.currentTime;

      // Warm celesta / music-box fundamental
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const decay = Math.min(2.4, dur * 1.45);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(this.filter);
      osc.start(now);
      osc.stop(now + decay + 0.05);

      // Subtle crystal overtone
      const shimmer = this.ctx.createOscillator();
      const shimmerGain = this.ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(freq * 2, now);

      shimmerGain.gain.setValueAtTime(0.0001, now);
      shimmerGain.gain.linearRampToValueAtTime(0.11, now + 0.015);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + decay * 0.55);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(this.filter);
      shimmer.start(now);
      shimmer.stop(now + decay * 0.6 + 0.05);
    } catch {
      // Ignore Web Audio errors on restricted browsers
    }
  }

  private playPadChord(freqs: number[], dur: number) {
    try {
      if (!this.ctx || !this.filter) return;
      const now = this.ctx.currentTime;
      const padDur = Math.max(1.8, dur * 2.4);

      freqs.forEach((f) => {
        if (!this.ctx || !this.filter) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.10, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + padDur);

        osc.connect(gain);
        gain.connect(this.filter);
        osc.start(now);
        osc.stop(now + padDur + 0.08);
      });
    } catch {
      // Ignore Web Audio errors on restricted browsers
    }
  }

  private scheduleNext() {
    if (!this.running) return;
    try {
      if (!this.ctx) return;

      // Wait if browser hasn't unlocked AudioContext yet
      if (this.ctx.state !== 'running') {
        this.timerId = window.setTimeout(() => this.scheduleNext(), 400);
        return;
      }

      const note = WINTER_BGM_SEQUENCE[this.stepIndex];
      if (note.freq > 0) {
        this.playBellNote(note.freq, note.dur);
      }
      if (note.chord && note.chord.length > 0) {
        this.playPadChord(note.chord, note.dur);
      }

      this.stepIndex = (this.stepIndex + 1) % WINTER_BGM_SEQUENCE.length;
      this.timerId = window.setTimeout(() => this.scheduleNext(), note.dur * 1000);
    } catch {
      this.stop();
    }
  }

  public start() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (this.running) return;
      this.running = true;
      this.scheduleNext();
    } catch {
      this.running = false;
    }
  }

  public stop() {
    this.running = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

export const winterBgm = new WinterBgmPlayer();

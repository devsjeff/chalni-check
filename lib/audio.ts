import type { SfxName } from "@/types";

const FILES: Record<SfxName | "music", string> = {
  music: "/audio/background-loop.wav",
  click: "/audio/click.wav",
  giggle: "/audio/giggle.wav",
  celebrate: "/audio/celebrate.wav",
  shutter: "/audio/shutter.wav",
};

const MELODY = [
  329.63, 392, 440, 392, 329.63, 293.66, 329.63, 392, 440, 523.25, 440, 392,
  349.23, 329.63, 293.66, 261.63,
];

type AudioContextCtor = typeof AudioContext;

function contextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const scoped = window as Window & { webkitAudioContext?: AudioContextCtor };
  return window.AudioContext ?? scoped.webkitAudioContext ?? null;
}

/**
 * Original festive audio. HTML audio files are tried first.
 * If a file is missing, a tiny synthesizer plays instead.
 * Nothing here is a copyrighted song.
 */
class FestiveAudio {
  private ctx: AudioContext | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private sfxEls = new Map<SfxName, HTMLAudioElement>();
  private musicFailed = false;
  private sfxFailed = new Set<SfxName>();
  private muted = false;
  private musicOn = false;
  private unlocked = false;
  private synthTimer: number | null = null;
  private musicGain: GainNode | null = null;
  private noteIndex = 0;

  unlock() {
    if (typeof window === "undefined") return;
    if (this.unlocked) {
      void this.ctx?.resume();
      return;
    }

    this.unlocked = true;
    const Ctor = contextCtor();
    if (Ctor) {
      this.ctx = new Ctor();
      void this.ctx.resume();
    }
    this.preload();
  }

  private preload() {
    this.musicEl = this.makeAudio(FILES.music, true);
    this.musicEl.addEventListener("error", () => {
      this.musicFailed = true;
    });

    (["click", "giggle", "celebrate", "shutter"] as const).forEach((name) => {
      const audio = this.makeAudio(FILES[name], false);
      audio.addEventListener("error", () => {
        this.sfxFailed.add(name);
      });
      this.sfxEls.set(name, audio);
    });
  }

  private makeAudio(src: string, loop: boolean) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.loop = loop;
    audio.volume = loop ? 0.16 : 0.28;
    return audio;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.musicEl) this.musicEl.muted = muted;
    if (this.musicGain) {
      this.musicGain.gain.value = muted || !this.musicOn ? 0 : 0.05;
    }
    if (muted) {
      this.musicEl?.pause();
      this.stopSynth();
      return;
    }
    if (this.musicOn) void this.startMusic();
  }

  async setMusic(on: boolean) {
    this.unlock();
    this.musicOn = on;
    if (!on) {
      this.musicEl?.pause();
      if (this.musicEl) this.musicEl.currentTime = 0;
      this.stopSynth();
      return;
    }
    if (this.muted) return;
    await this.startMusic();
  }

  private async startMusic() {
    if (this.musicEl && !this.musicFailed) {
      try {
        await this.musicEl.play();
        this.stopSynth();
        return;
      } catch (error) {
        const name = error instanceof DOMException ? error.name : "";
        if (name === "NotAllowedError") return;
        this.musicFailed = true;
      }
    }
    this.startSynth();
  }

  play(name: SfxName) {
    if (!this.unlocked || this.muted) return;
    const element = this.sfxEls.get(name);
    if (element && !this.sfxFailed.has(name)) {
      element.currentTime = 0;
      void element.play().catch((error: unknown) => {
        const reason = error instanceof DOMException ? error.name : "";
        if (reason === "NotAllowedError") return;
        this.sfxFailed.add(name);
        this.synthSfx(name);
      });
      return;
    }
    this.synthSfx(name);
  }

  private startSynth() {
    if (!this.ctx || this.synthTimer !== null) return;
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.045;
    gain.connect(ctx.destination);
    this.musicGain = gain;

    const tick = () => {
      if (!this.ctx || !this.musicOn || this.muted) return;
      const freq = MELODY[this.noteIndex % MELODY.length] ?? 392;
      this.noteIndex += 1;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const now = this.ctx.currentTime;
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.connect(env);
      env.connect(gain);
      osc.start(now);
      osc.stop(now + 0.42);
    };

    tick();
    this.synthTimer = window.setInterval(tick, 480);
  }

  private stopSynth() {
    if (this.synthTimer !== null) {
      window.clearInterval(this.synthTimer);
      this.synthTimer = null;
    }
    this.musicGain?.disconnect();
    this.musicGain = null;
  }

  private synthSfx(name: SfxName) {
    if (!this.ctx) return;
    if (name === "shutter") {
      this.playNoise(0.12, 0.2);
      this.playTone(180, 0.08, 0.12, "square");
      return;
    }
    if (name === "click") {
      this.playTone(740, 0.07, 0.12, "sine");
      return;
    }
    if (name === "giggle") {
      this.playTone(880, 0.09, 0.1, "sine");
      window.setTimeout(() => this.playTone(1174, 0.1, 0.08, "sine"), 90);
      return;
    }
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      window.setTimeout(() => this.playTone(freq, 0.16, 0.09, "triangle"), index * 90);
    });
  }

  private playTone(
    freq: number,
    duration: number,
    amp: number,
    type: OscillatorType,
  ) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(amp, now + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(env);
    env.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playNoise(duration: number, amp: number) {
    if (!this.ctx) return;
    const length = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const source = this.ctx.createBufferSource();
    const env = this.ctx.createGain();
    source.buffer = buffer;
    env.gain.value = amp;
    source.connect(env);
    env.connect(this.ctx.destination);
    source.start();
  }
}

let engine: FestiveAudio | null = null;

export function getAudio() {
  if (typeof window === "undefined") return null;
  if (!engine) engine = new FestiveAudio();
  return engine;
}

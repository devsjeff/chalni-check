import type { Line } from "../data/script";
import { AMBIENT_PATH, DURATIONS_PATH, hasAsset, sfxPath, voicePath } from "../engine/assets";
import { clockNow } from "./clock";
import { estimateSeconds } from "./subtitles";
import { pauseSpeech, primeSpeech, resumeSpeech, speak, type SpeechHandle } from "./tts-fallback";

export type SfxName = "diya-ignite" | "wind-chime" | "bangles" | "bell" | "pour-gulp" | "heartbeat" | "whoosh";

export type LineMode = "loading" | "mp3" | "tts" | "text";

export interface LineHandle {
  readonly line: Line;
  mode(): LineMode;
  /** 0..1, pauses with the tab. */
  progress(): number;
  readonly done: Promise<void>;
  stop(): void;
}

type Listener = () => void;

const AMBIENT_VOLUME = 0.18;
const AMBIENT_DUCKED = 0.07;
const SFX_VOLUME = 0.55;

interface ActiveLine {
  handle: LineHandle;
  muteSwitch(): void;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private voiceBus: GainNode | null = null;
  private ambientBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private meterData: Float32Array<ArrayBuffer> | null = null;

  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private durations: Record<string, number> = {};
  private durationsLoaded: Promise<void> | null = null;

  private active: ActiveLine | null = null;
  private speechLevel = false;
  private mp3Playing = false;
  private voiceLevel = 0;
  private lastWritten = -1;
  private meterStarted = false;

  private ambientStarted = false;
  private ambientEl: HTMLAudioElement | null = null;
  private unlocked = false;
  private listeners = new Set<Listener>();
  muted = false;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  isSpeaking() {
    return this.active !== null;
  }

  /**
   * Must run synchronously inside a tap/click handler. Browsers (iOS Safari
   * above all) keep every AudioContext suspended and block speechSynthesis
   * until a user gesture, so the first tap on the gate creates and resumes
   * the context, plays a silent buffer and primes speech in the same call stack.
   */
  unlock() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = "playback";
    } catch {
      // iOS-only API; the silent switch may still mute Web Audio elsewhere.
    }

    if (!this.ctx) {
      const Ctor = window.AudioContext ?? window.webkitAudioContext;
      if (Ctor) {
        try {
          this.ctx = new Ctor();
          this.buildGraph(this.ctx);
        } catch {
          this.ctx = null;
        }
      }
    }

    if (this.ctx) {
      void this.ctx.resume().catch(() => undefined);
      try {
        const silent = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = silent;
        source.connect(this.ctx.destination);
        source.start(0);
      } catch {
        // Ignore; resume() above is usually enough.
      }
    }

    primeSpeech();

    if (!this.unlocked) {
      this.unlocked = true;
      document.addEventListener("visibilitychange", this.onVisibility);
      this.startMeter();
      void this.loadDurations();
    }
  }

  private buildGraph(ctx: AudioContext) {
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(ctx.destination);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.meterData = new Float32Array(this.analyser.fftSize);

    this.voiceBus = ctx.createGain();
    this.voiceBus.gain.value = 1;
    this.voiceBus.connect(this.analyser);
    this.analyser.connect(this.master);

    this.ambientBus = ctx.createGain();
    this.ambientBus.gain.value = AMBIENT_VOLUME;
    this.ambientBus.connect(this.master);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = SFX_VOLUME;
    this.sfxBus.connect(this.master);
  }

  private onVisibility = () => {
    if (document.hidden) {
      void this.ctx?.suspend().catch(() => undefined);
      this.ambientEl?.pause();
      pauseSpeech();
    } else {
      void this.ctx?.resume().catch(() => undefined);
      if (this.ambientEl && !this.muted) void this.ambientEl.play().catch(() => undefined);
      resumeSpeech();
    }
  };

  loadDurations(): Promise<void> {
    if (this.durationsLoaded) return this.durationsLoaded;
    this.durationsLoaded = (async () => {
      if (!hasAsset(DURATIONS_PATH)) return;
      try {
        const response = await fetch(DURATIONS_PATH);
        if (response.ok) this.durations = (await response.json()) as Record<string, number>;
      } catch {
        // Estimated durations are used instead.
      }
    })();
    return this.durationsLoaded;
  }

  durationOf(line: Line): number {
    return this.durations[line.id] ?? estimateSeconds(line);
  }

  private loadBuffer(path: string): Promise<AudioBuffer | null> {
    const cached = this.buffers.get(path);
    if (cached) return cached;
    const ctx = this.ctx;
    if (!ctx || !hasAsset(path)) return Promise.resolve(null);
    const promise = (async () => {
      try {
        const response = await fetch(path);
        if (!response.ok) return null;
        const data = await response.arrayBuffer();
        return await new Promise<AudioBuffer | null>((resolve) => {
          // Callback form keeps older Safari working.
          ctx.decodeAudioData(data, resolve, () => resolve(null));
        });
      } catch {
        return null;
      }
    })();
    this.buffers.set(path, promise);
    return promise;
  }

  preloadLine(id: string) {
    void this.loadBuffer(voicePath(id));
  }

  hasVoiceFile(id: string) {
    return hasAsset(voicePath(id));
  }

  stopLine() {
    this.active?.handle.stop();
  }

  playLine(line: Line): LineHandle {
    this.stopLine();

    let mode: LineMode = "loading";
    let finished = false;
    let duration = this.durationOf(line);
    let startedAt = clockNow();
    let ctxStart = 0;
    let source: AudioBufferSourceNode | null = null;
    let speech: SpeechHandle | null = null;
    let textTimer: number | null = null;
    let safetyTimer: number | null = null;
    let resolveDone!: () => void;
    const done = new Promise<void>((resolve) => {
      resolveDone = resolve;
    });

    const clearTimers = () => {
      if (textTimer !== null) window.clearInterval(textTimer);
      if (safetyTimer !== null) window.clearTimeout(safetyTimer);
      textTimer = null;
      safetyTimer = null;
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimers();
      this.mp3Playing = false;
      this.speechLevel = false;
      if (this.active?.handle === handle) this.active = null;
      this.duck(false);
      this.emit();
      resolveDone();
    };

    const runText = (fromStart: boolean) => {
      mode = "text";
      this.speechLevel = false;
      if (fromStart) startedAt = clockNow();
      textTimer = window.setInterval(() => {
        if (clockNow() - startedAt >= duration * 1000) finish();
      }, 80);
    };

    const runSpeech = () => {
      const handleSpeech = speak(line.hindi, line.speaker, {
        onStart: () => {
          if (finished || mode !== "tts") return;
          startedAt = clockNow();
          this.speechLevel = true;
        },
        onEnd: () => {
          if (mode === "tts") finish();
        },
      });
      if (!handleSpeech) {
        runText(true);
        return;
      }
      speech = handleSpeech;
      mode = "tts";
      startedAt = clockNow();
      // Some engines never fire onend; never let a line block the scene.
      safetyTimer = window.setTimeout(finish, duration * 2200 + 3000);
    };

    const handle: LineHandle = {
      line,
      mode: () => mode,
      progress: () => {
        if (finished) return 1;
        if (mode === "loading") return 0;
        if (mode === "mp3" && this.ctx) return Math.min(1, (this.ctx.currentTime - ctxStart) / duration);
        const value = (clockNow() - startedAt) / (duration * 1000);
        return Math.min(mode === "tts" ? 0.97 : 1, Math.max(0, value));
      },
      done,
      stop: () => {
        if (finished) return;
        try {
          source?.stop();
        } catch {
          // Already stopped.
        }
        speech?.cancel();
        finish();
      },
    };

    this.active = {
      handle,
      muteSwitch: () => {
        if (mode === "tts" && speech) {
          speech.cancel();
          speech = null;
          if (safetyTimer !== null) window.clearTimeout(safetyTimer);
          safetyTimer = null;
          runText(false);
        }
      },
    };
    this.duck(true);
    this.emit();

    const begin = async () => {
      if (this.muted || !this.ctx) {
        if (!this.muted && !this.ctx) runSpeech();
        else runText(true);
        return;
      }
      const buffer = this.hasVoiceFile(line.id)
        ? await Promise.race([
            this.loadBuffer(voicePath(line.id)),
            new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 4000)),
          ])
        : null;
      if (finished) return;
      if (buffer && this.ctx && this.voiceBus) {
        duration = buffer.duration;
        source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.voiceBus);
        source.onended = finish;
        mode = "mp3";
        this.mp3Playing = true;
        ctxStart = this.ctx.currentTime + 0.02;
        source.start(ctxStart);
        return;
      }
      if (this.muted) runText(true);
      else runSpeech();
    };
    void begin();

    return handle;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
    if (this.ambientEl) {
      if (muted) this.ambientEl.pause();
      else void this.ambientEl.play().catch(() => undefined);
    }
    if (muted) this.active?.muteSwitch();
    this.emit();
  }

  private duck(on: boolean) {
    if (!this.ctx || !this.ambientBus) return;
    this.ambientBus.gain.setTargetAtTime(on ? AMBIENT_DUCKED : AMBIENT_VOLUME, this.ctx.currentTime, 0.25);
  }

  startAmbient() {
    if (this.ambientStarted || !this.ctx || !this.ambientBus) return;
    this.ambientStarted = true;

    if (hasAsset(AMBIENT_PATH)) {
      const element = new Audio(AMBIENT_PATH);
      element.loop = true;
      element.preload = "auto";
      try {
        this.ctx.createMediaElementSource(element).connect(this.ambientBus);
      } catch {
        element.volume = AMBIENT_VOLUME;
      }
      this.ambientEl = element;
      if (!this.muted) void element.play().catch(() => undefined);
      return;
    }
    this.startDrone(this.ctx, this.ambientBus);
  }

  /** Original fallback pad: a soft tanpura-style drone with the odd wind chime. */
  private startDrone(ctx: AudioContext, bus: GainNode) {
    const pad = ctx.createGain();
    pad.gain.value = 0;
    pad.gain.setTargetAtTime(0.32, ctx.currentTime, 2.5);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.4;
    filter.connect(pad);
    pad.connect(bus);

    const voices: [number, OscillatorType, number][] = [
      [73.42, "sine", 0.5],
      [146.83, "triangle", 0.32],
      [220.0, "triangle", 0.2],
      [293.66, "sine", 0.14],
      [147.2, "sine", 0.12],
    ];
    voices.forEach(([freq, type, level], index) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const amp = ctx.createGain();
      amp.gain.value = level;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + index * 0.023;
      const lfoAmp = ctx.createGain();
      lfoAmp.gain.value = level * 0.45;
      lfo.connect(lfoAmp);
      lfoAmp.connect(amp.gain);
      osc.connect(amp);
      amp.connect(filter);
      osc.start();
      lfo.start();
    });

    const scheduleChime = () => {
      window.setTimeout(() => {
        if (!document.hidden && !this.muted) this.synthSfx("wind-chime", 0.22);
        scheduleChime();
      }, 9000 + Math.random() * 9000);
    };
    scheduleChime();
  }

  sfx(name: SfxName, volume = 1) {
    if (!this.ctx || !this.sfxBus || this.muted) return;
    const path = sfxPath(name);
    if (hasAsset(path)) {
      void this.loadBuffer(path).then((buffer) => {
        if (!buffer || !this.ctx || !this.sfxBus) return this.synthSfx(name, volume);
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        gain.gain.value = volume;
        source.buffer = buffer;
        source.connect(gain);
        gain.connect(this.sfxBus);
        source.start();
      });
      return;
    }
    this.synthSfx(name, volume);
  }

  private tone(freq: number, start: number, length: number, peak: number, type: OscillatorType = "sine", endFreq?: number) {
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus) return;
    const t = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + length);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(env);
    env.connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + length + 0.05);
  }

  private noise(start: number, length: number, peak: number, from: number, to: number) {
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus) return;
    const t = ctx.currentTime + start;
    const frames = Math.floor(ctx.sampleRate * length);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + length);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + length * 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, t + length);
    source.connect(filter);
    filter.connect(env);
    env.connect(this.sfxBus);
    source.start(t);
  }

  private synthSfx(name: SfxName, volume = 1) {
    const v = volume;
    switch (name) {
      case "wind-chime": {
        const notes = [1568, 1760, 2093, 2349, 2637, 3136];
        for (let i = 0; i < 4; i += 1) {
          const note = notes[Math.floor(Math.random() * notes.length)] ?? 2093;
          this.tone(note, i * 0.09 + Math.random() * 0.04, 1.6, 0.09 * v);
          this.tone(note * 2.01, i * 0.09, 0.7, 0.025 * v);
        }
        break;
      }
      case "bell":
        this.tone(880, 0, 2.4, 0.14 * v);
        this.tone(880 * 2.76, 0, 1.2, 0.05 * v);
        this.tone(880 * 5.4, 0, 0.5, 0.02 * v);
        break;
      case "bangles":
        for (let i = 0; i < 5; i += 1) {
          this.tone(3200 + Math.random() * 1800, i * 0.06 + Math.random() * 0.03, 0.16, 0.05 * v, "triangle");
        }
        break;
      case "diya-ignite":
        this.noise(0, 0.35, 0.12 * v, 2400, 500);
        this.tone(220, 0.05, 0.5, 0.04 * v);
        break;
      case "pour-gulp":
        this.tone(200, 0, 0.14, 0.16 * v, "sine", 85);
        this.noise(0.02, 0.1, 0.03 * v, 600, 300);
        break;
      case "heartbeat":
        this.tone(62, 0, 0.2, 0.42 * v, "sine", 44);
        this.tone(124, 0, 0.08, 0.06 * v);
        this.tone(56, 0.24, 0.24, 0.3 * v, "sine", 40);
        break;
      case "whoosh":
        this.noise(0, 0.8, 0.08 * v, 300, 2200);
        break;
    }
  }

  /** Drives --voice (0..1) from the analyser, or a simulated level for speechSynthesis. */
  private startMeter() {
    if (this.meterStarted) return;
    this.meterStarted = true;
    const root = document.documentElement;
    const loop = (time: number) => {
      let target = 0;
      if (this.mp3Playing && this.analyser && this.meterData) {
        this.analyser.getFloatTimeDomainData(this.meterData);
        let sum = 0;
        for (let i = 0; i < this.meterData.length; i += 1) sum += this.meterData[i]! * this.meterData[i]!;
        target = Math.min(1, Math.sqrt(sum / this.meterData.length) * 5.5);
      } else if (this.speechLevel) {
        const t = time / 1000;
        target = 0.35 + 0.22 * Math.sin(t * 9.1) + 0.14 * Math.sin(t * 23.7);
      }
      this.voiceLevel += (target - this.voiceLevel) * (target > this.voiceLevel ? 0.35 : 0.12);
      const rounded = Math.round(this.voiceLevel * 100) / 100;
      if (rounded !== this.lastWritten) {
        this.lastWritten = rounded;
        root.style.setProperty("--voice", String(Math.max(0, rounded)));
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

export const engine = new AudioEngine();

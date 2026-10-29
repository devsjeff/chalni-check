import type { Speaker } from "../data/script";

let voices: SpeechSynthesisVoice[] = [];
let primed = false;

export function ttsAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

function refreshVoices() {
  try {
    voices = window.speechSynthesis.getVoices();
  } catch {
    voices = [];
  }
}

/** iOS only lets speechSynthesis talk after it has spoken once inside a user gesture. */
export function primeSpeech() {
  if (!ttsAvailable() || primed) return;
  primed = true;
  refreshVoices();
  try {
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
  } catch {
    // Older Safari: getVoices() eventually fills in on its own.
  }
  try {
    const silent = new SpeechSynthesisUtterance(" ");
    silent.volume = 0;
    window.speechSynthesis.speak(silent);
  } catch {
    // Ignore; the subtitle timer still runs.
  }
}

const FEMALE = /swara|female|woman|kalpana|lekha|heera|priya|neerja|aditi|veena|lata|google हिन्दी/i;
const MALE = /madhur|male|hemant|rishi|prabhat|ravi|kiran|aarav/i;

function pickVoice(speaker: Speaker): SpeechSynthesisVoice | null {
  if (!voices.length) refreshVoices();
  const norm = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace("_", "-");
  const hiIN = voices.filter((v) => norm(v) === "hi-in");
  const hindi = voices.filter((v) => norm(v).startsWith("hi"));
  const pool = hiIN.length ? hiIN : hindi.length ? hindi : voices;
  if (!pool.length) return null;
  const wanted = speaker === "her" ? FEMALE : MALE;
  return pool.find((v) => wanted.test(v.name)) ?? pool[0] ?? null;
}

export interface SpeechHandle {
  cancel(): void;
}

/**
 * Speaks a Devanagari line with the best Hindi voice available.
 * Returns null when the browser has no usable speech engine.
 */
export function speak(
  text: string,
  speaker: Speaker,
  events: { onStart(): void; onEnd(): void },
): SpeechHandle | null {
  if (!ttsAvailable()) return null;
  const voice = pickVoice(speaker);
  if (!voice) return null;

  let settled = false;
  const end = () => {
    if (settled) return;
    settled = true;
    events.onEnd();
  };

  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang || "hi-IN";
    utterance.rate = 0.92;
    utterance.pitch = speaker === "her" ? 1.08 : 0.9;
    utterance.onstart = () => events.onStart();
    utterance.onend = end;
    utterance.onerror = end;
    synth.speak(utterance);
    return {
      cancel() {
        settled = true;
        try {
          synth.cancel();
        } catch {
          // Nothing else to stop.
        }
      },
    };
  } catch {
    return null;
  }
}

export function pauseSpeech() {
  try {
    if (ttsAvailable()) window.speechSynthesis.pause();
  } catch {
    // Unsupported.
  }
}

export function resumeSpeech() {
  try {
    if (ttsAvailable()) window.speechSynthesis.resume();
  } catch {
    // Unsupported.
  }
}

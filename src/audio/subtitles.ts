import type { Line } from "../data/script";

export type Lang = "hinglish" | "hindi" | "en";

export const LANGS: Lang[] = ["hinglish", "hindi", "en"];

export const LANG_LABEL: Record<Lang, string> = {
  hinglish: "Hinglish",
  hindi: "हिंदी",
  en: "English",
};

export const LANG_SHORT: Record<Lang, string> = {
  hinglish: "Aa",
  hindi: "अ",
  en: "En",
};

export function lineText(line: Line, lang: Lang): string {
  return line[lang];
}

export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Seconds the line takes when no measured duration exists (reading-speed pace). */
export function estimateSeconds(line: Line): number {
  const words = splitWords(line.hinglish).length;
  return Math.max(2.4, words * 0.43 + 0.9);
}

/** Words shown at a given progress; text runs slightly ahead of the voice. */
export function revealedWords(total: number, progress: number): number {
  if (progress >= 1) return total;
  return Math.min(total, Math.ceil(progress * total * 1.12));
}

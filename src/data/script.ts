import raw from "./script.json";

export type Speaker = "her" | "him";

export interface Line {
  id: string;
  speaker: Speaker;
  scene: string;
  hinglish: string;
  hindi: string;
  en: string;
}

export const LINES: Record<string, Line> = Object.fromEntries(
  (raw as Line[]).map((line) => [line.id, line]),
);

export function line(id: string): Line {
  const found = LINES[id];
  if (!found) throw new Error(`Unknown line ${id}`);
  return found;
}

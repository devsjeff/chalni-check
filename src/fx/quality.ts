import { prefersReducedMotion } from "../engine/env";

export type Quality = "high" | "low" | "reduced";

let quality: Quality = prefersReducedMotion() ? "reduced" : "high";
const listeners = new Set<() => void>();

export const getQuality = () => quality;

export function subscribeQuality(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setQuality(next: Quality) {
  if (next === quality) return;
  quality = next;
  listeners.forEach((listener) => listener());
}

/** Total particle budget: 120 normally, 40 on struggling devices or reduced motion. */
export const particleBudget = () => (quality === "high" ? 120 : 40);

export const DPR = () => Math.min(2, window.devicePixelRatio || 1);

let slowSince: number | null = null;
let last = 0;

/** Called once per frame by the sky loop; drops to low quality after 2 s above 20 ms. */
export function reportFrame(now: number) {
  if (quality !== "high") return;
  const delta = last ? now - last : 16;
  last = now;
  if (delta > 20 && delta < 250) {
    slowSince ??= now;
    if (now - slowSince > 2000) setQuality("low");
  } else if (delta <= 20) {
    slowSince = null;
  }
}

if (typeof window !== "undefined") {
  try {
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (event) => {
      setQuality(event.matches ? "reduced" : "high");
    });
  } catch {
    // Older browsers: keep the initial value.
  }
}

import manifest from "virtual:asset-manifest";

const files = new Set(manifest);

export const hasAsset = (path: string) => files.has(path);

export const imgPath = (name: string) => `/assets/img/${name}.webp`;
export const videoPath = (name: string) => `/assets/video/${name}.mp4`;
export const voicePath = (id: string) => `/audio/voice/${id}.mp3`;
export const sfxPath = (name: string) => `/assets/audio/sfx/${name}.mp3`;
export const AMBIENT_PATH = "/assets/audio/ambient.mp3";
export const DURATIONS_PATH = "/audio/voice/durations.json";

export function imageIfPresent(name: string): string | null {
  const path = imgPath(name);
  return hasAsset(path) ? path : null;
}

export function videoIfPresent(name: string): string | null {
  const path = videoPath(name);
  return hasAsset(path) ? path : null;
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

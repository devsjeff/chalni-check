export const params = new URLSearchParams(window.location.search);

export const DEBUG = import.meta.env.DEV || params.get("debug") === "1";

/** Plain text only, max 20 characters. React renders it as text, never HTML. */
export function sanitizeName(raw: string | null | undefined): string {
  if (!raw) return "";
  const clean = raw
    .replace(/[\u0000-\u001f\u007f-\u009f<>{}\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(clean).slice(0, 20).join("").trim();
}

type StoreKind = "local" | "session";

function store(kind: StoreKind): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStore(kind: StoreKind, key: string): string | null {
  try {
    return store(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStore(kind: StoreKind, key: string, value: string) {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    // Storage is blocked in some in-app webviews; the app works without it.
  }
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|FB_IAB|FBIOS|Instagram|WhatsApp|Telegram|MicroMessenger|Line\//i.test(ua);
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Unsupported (iOS) or blocked; skip silently.
  }
}

export const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

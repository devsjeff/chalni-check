/**
 * A clock that stops while the tab is hidden, so text-timed subtitles and
 * speechSynthesis fallbacks pause with the rest of the experience.
 */
let offset = 0;
let hiddenAt: number | null = null;

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const now = performance.now();
    if (document.hidden) {
      hiddenAt = now;
    } else if (hiddenAt !== null) {
      offset += now - hiddenAt;
      hiddenAt = null;
    }
  });
}

export function clockNow(): number {
  return (hiddenAt ?? performance.now()) - offset;
}

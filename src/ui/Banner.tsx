import { useState } from "react";
import { isInAppBrowser, readStore, writeStore } from "../engine/env";

const KEY = "kc-inapp-dismissed";

/** WhatsApp/Instagram/Facebook/Telegram webviews: suggest a real browser, but keep working. */
export function Banner() {
  const [open, setOpen] = useState(() => isInAppBrowser() && readStore("session", KEY) !== "1");
  if (!open) return null;
  return (
    <div className="inapp-banner" role="note">
      <span>Behtar experience ke liye Chrome ya Safari mein kholo</span>
      <button
        type="button"
        aria-label="Band karo"
        onClick={() => {
          writeStore("session", KEY, "1");
          setOpen(false);
        }}
      >
        ×
      </button>
    </div>
  );
}

/** Landscape phones get a gentle nudge (shown purely with CSS media queries). */
export function RotateHint() {
  return (
    <div className="rotate-hint" aria-hidden="true">
      <p>Phone ko seedha karo</p>
    </div>
  );
}

"use client";

import { useId } from "react";

export function MoonGraphic({ className = "" }: { className?: string }) {
  const raw = useId().replace(/:/g, "");
  const glow = `${raw}-glow`;

  return (
    <svg
      viewBox="0 0 120 120"
      className={`moon-float ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8df" />
          <stop offset="58%" stopColor="#f3e2a8" />
          <stop offset="100%" stopColor="#f3e2a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill={`url(#${glow})`} />
      <circle cx="60" cy="60" r="28" fill="#fff6d8" />
      <circle cx="50" cy="52" r="4" fill="#ead9a2" />
      <circle cx="68" cy="66" r="6" fill="#ead9a2" />
      <circle cx="58" cy="72" r="3" fill="#ead9a2" />
    </svg>
  );
}

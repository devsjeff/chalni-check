import { useRef } from "react";
import { imageIfPresent } from "../engine/assets";
import { vibrate } from "../engine/env";
import { useHold } from "./useHold";
import type { InteractionProps } from "./types";

function GlassArt({ level }: { level: number }) {
  const photo = imageIfPresent("prop-glass");
  const waterTop = 30 + (1 - level) * 140;
  if (photo) {
    return (
      <div className="glass-photo">
        <img src={photo} alt="" draggable={false} />
        <div className="glass-photo-water" style={{ top: `${18 + (1 - level) * 70}%` }} />
      </div>
    );
  }
  return (
    <svg viewBox="0 0 120 200" className="glass-svg" aria-hidden="true">
      <defs>
        <linearGradient id="glass-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(210,228,255,0.55)" />
          <stop offset="100%" stopColor="rgba(120,160,230,0.35)" />
        </linearGradient>
        <clipPath id="glass-inside">
          <path d="M14 14 L106 14 L94 190 L26 190 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#glass-inside)">
        <rect x="0" y={waterTop} width="120" height="200" fill="url(#glass-water)" />
        <ellipse cx="60" cy={waterTop} rx="48" ry="4" fill="rgba(255,255,255,0.45)" />
      </g>
      <path d="M12 10 L108 10 L95 192 L25 192 Z" fill="rgba(220,235,255,0.06)" stroke="rgba(235,242,255,0.75)" strokeWidth="3" />
      <path d="M28 22 L36 180" stroke="rgba(255,255,255,0.55)" strokeWidth="5" strokeLinecap="round" />
      <path d="M25 192 L95 192" stroke="rgba(235,242,255,0.9)" strokeWidth="5" />
    </svg>
  );
}

/**
 * Press and hold the glass. "give": it rises toward her and she sips.
 * "drink": first person, it comes up to the player's lips and the eyes close.
 */
export function SipHold({
  active,
  completed,
  onActivity,
  onComplete,
  onHoldChange,
  onEarly,
  sfx,
  variant,
}: InteractionProps & { variant: "give" | "drink" }) {
  const nextGulp = useRef(0);
  const hold = useHold({
    active,
    seconds: 3,
    keepProgress: true,
    onStart: () => {
      onActivity();
      onHoldChange?.(true);
      nextGulp.current = 0.12;
    },
    onTick: (progress) => {
      if (progress >= nextGulp.current) {
        sfx("pour-gulp");
        nextGulp.current += 0.3;
      }
    },
    onRelease: () => {
      onHoldChange?.(false);
      onEarly?.();
    },
    onComplete: () => {
      vibrate([30, 50, 60]);
      onHoldChange?.(true);
      onComplete();
    },
  });

  const level = completed ? 0.06 : 1 - hold.progress * 0.94;
  const raised = hold.holding || completed;

  return (
    <div className={`sip sip-${variant} ${raised ? "is-raised" : ""} ${completed ? "is-done" : ""}`}>
      {variant === "drink" ? (
        <div className="sip-eyes" style={{ opacity: completed ? 0 : hold.progress * 0.85 }} aria-hidden="true" />
      ) : null}
      <button
        type="button"
        className="sip-glass touch-none"
        disabled={!active || completed}
        aria-label="Glass ko dabaye rakho"
        {...hold.bind}
      >
        <GlassArt level={level} />
      </button>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { vibrate } from "../engine/env";
import { useHold } from "./useHold";
import type { InteractionProps } from "./types";

const BEAT_MS = 860;

/** Hold anywhere: his heartbeat plays, the screen pulses warmly in rhythm, the phone vibrates gently. */
export function HeartbeatHold({ active, completed, reduced, onActivity, onComplete, sfx }: InteractionProps) {
  const beatTimer = useRef<number | null>(null);
  const hold = useHold({
    active,
    seconds: BEAT_MS * 5 / 1000,
    keepProgress: true,
    onStart: onActivity,
    onComplete: () => {
      sfx("wind-chime", 0.6);
      onComplete();
    },
  });

  useEffect(() => {
    if (!hold.holding) return;
    const beat = () => {
      sfx("heartbeat", 1);
      vibrate([35, 140, 45]);
    };
    beat();
    beatTimer.current = window.setInterval(beat, BEAT_MS);
    return () => {
      if (beatTimer.current !== null) window.clearInterval(beatTimer.current);
      beatTimer.current = null;
    };
  }, [hold.holding, sfx]);

  return (
    <div
      className="interaction-area touch-none"
      role="button"
      tabIndex={active && !completed ? 0 : -1}
      aria-label="Dhadkan suno: screen ko dabaye rakho"
      {...hold.bind}
    >
      <div
        className={`heart-pulse ${hold.holding && !reduced ? "is-beating" : ""}`}
        style={{ opacity: hold.holding ? 1 : completed ? 0.35 : 0 }}
        aria-hidden="true"
      />
      {active && !completed ? (
        <svg className="heart-meter" viewBox="0 0 48 44" aria-hidden="true">
          <defs>
            <clipPath id="heart-clip">
              <rect x="0" y={44 - hold.progress * 44} width="48" height="44" />
            </clipPath>
          </defs>
          <path
            d="M24 41S3 28 3 14C3 7 8 3 13.5 3 18 3 21.5 5.5 24 9c2.5-3.5 6-6 10.5-6C40 3 45 7 45 14c0 14-21 27-21 27z"
            fill="none"
            stroke="rgba(244,236,216,0.7)"
            strokeWidth="2"
          />
          <path
            d="M24 41S3 28 3 14C3 7 8 3 13.5 3 18 3 21.5 5.5 24 9c2.5-3.5 6-6 10.5-6C40 3 45 7 45 14c0 14-21 27-21 27z"
            fill="#C1121F"
            clipPath="url(#heart-clip)"
          />
        </svg>
      ) : null}
    </div>
  );
}

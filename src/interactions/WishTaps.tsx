import { useRef, useState } from "react";
import { launchShootingStar } from "../fx/SkyCanvas";
import { isActivateKey, localPoint, type InteractionProps } from "./types";

interface Lantern {
  id: number;
  x: number;
  y: number;
  drift: number;
}

const NEEDED = 5;

/** Each tap releases a diya-lantern with a heart; after five, a shooting star crosses the sky. */
export function WishTaps({ active, completed, onActivity, onComplete, sfx }: InteractionProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [lanterns, setLanterns] = useState<Lantern[]>([]);
  const count = useRef(0);
  const idRef = useRef(0);
  const [taps, setTaps] = useState(0);

  const release = (x: number, y: number) => {
    if (!active || count.current >= NEEDED) return;
    onActivity();
    count.current += 1;
    setTaps(count.current);
    idRef.current += 1;
    const lantern = { id: idRef.current, x, y, drift: (Math.random() - 0.5) * 60 };
    setLanterns((list) => [...list.slice(-8), lantern]);
    sfx("diya-ignite", 0.7);
    window.setTimeout(() => setLanterns((list) => list.filter((l) => l.id !== lantern.id)), 6200);
    if (count.current === NEEDED) {
      window.setTimeout(() => {
        launchShootingStar();
        sfx("wind-chime");
      }, 500);
      window.setTimeout(onComplete, 2300);
    }
  };

  return (
    <div
      ref={areaRef}
      className="interaction-area"
      role="button"
      tabIndex={active && !completed ? 0 : -1}
      aria-label={`Aasmaan par tap karke wish bhejo, ${NEEDED - taps} baaki`}
      onPointerDown={(event) => {
        const area = areaRef.current;
        if (!area) return;
        const p = localPoint(event, area);
        release(p.x, Math.min(p.y, p.h * 0.72));
      }}
      onKeyDown={(event) => {
        const area = areaRef.current;
        if (!area || !isActivateKey(event)) return;
        event.preventDefault();
        const rect = area.getBoundingClientRect();
        release(rect.width * (0.25 + Math.random() * 0.5), rect.height * (0.45 + Math.random() * 0.2));
      }}
    >
      {lanterns.map((lantern) => (
        <div
          key={lantern.id}
          className="wish-lantern"
          style={{ left: lantern.x, top: lantern.y, "--drift": `${lantern.drift}px` } as React.CSSProperties}
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 52">
            <defs>
              <linearGradient id={`lan-${lantern.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD58A" />
                <stop offset="100%" stopColor="#E8701A" />
              </linearGradient>
            </defs>
            <path d="M8 6 Q20 0 32 6 L35 40 Q20 48 5 40 Z" fill={`url(#lan-${lantern.id})`} opacity="0.95" />
            <path
              d="M20 31s-7-4.4-7-9.2c0-2.3 1.7-3.8 3.6-3.8 1.4 0 2.6.8 3.4 2 .8-1.2 2-2 3.4-2 1.9 0 3.6 1.5 3.6 3.8 0 4.8-7 9.2-7 9.2z"
              fill="#C1121F"
            />
          </svg>
        </div>
      ))}
      {active && !completed ? (
        <div className="wish-count" aria-hidden="true">
          {Array.from({ length: NEEDED }, (_, i) => (
            <span key={i} className={i < taps ? "is-lit" : ""} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

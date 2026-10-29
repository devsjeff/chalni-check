import { useRef, useState } from "react";
import { useHold } from "./useHold";
import { localPoint, type InteractionProps } from "./types";

/** Hold anywhere for 2 s: a ring of fine chalni mesh and sparkles fades in around the edges. */
export function ChalniLook({ active, completed, onActivity, onComplete, onHoldChange, sfx }: InteractionProps) {
  const [point, setPoint] = useState({ x: 0.5, y: 0.6 });
  const areaRef = useRef<HTMLDivElement>(null);
  const hold = useHold({
    active,
    seconds: 2,
    keepProgress: false,
    onStart: () => {
      onActivity();
      onHoldChange?.(true);
      sfx("bangles", 0.6);
    },
    onRelease: () => onHoldChange?.(false),
    onComplete: () => {
      onHoldChange?.(true);
      sfx("wind-chime");
      onComplete();
    },
  });

  const show = completed ? 1 : hold.progress;
  const circumference = 2 * Math.PI * 34;

  return (
    <div
      ref={areaRef}
      className="interaction-area touch-none"
      role="button"
      tabIndex={active ? 0 : -1}
      aria-label="Chalni se dekho: screen ko do second dabaye rakho"
      {...hold.bind}
      onPointerDown={(event) => {
        if (areaRef.current) {
          const p = localPoint(event, areaRef.current);
          setPoint({ x: p.x / p.w, y: p.y / p.h });
        }
        hold.bind.onPointerDown(event);
      }}
    >
      <div className="chalni-ring" style={{ opacity: show }}>
        <div className="chalni-ring-mesh" />
        <div className="chalni-ring-rim" />
        <div className="chalni-ring-glow" />
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="chalni-sparkle" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      {hold.holding && !completed ? (
        <svg
          className="hold-ring"
          style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          viewBox="0 0 80 80"
          aria-hidden="true"
        >
          <circle cx="40" cy="40" r="34" className="hold-ring-track" />
          <circle
            cx="40"
            cy="40"
            r="34"
            className="hold-ring-fill"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - hold.progress)}
          />
        </svg>
      ) : null}
    </div>
  );
}

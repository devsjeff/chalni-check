import { useEffect, useRef, useState } from "react";
import { vibrate } from "../engine/env";
import { MOON_SPARKLE_EVENT } from "../fx/Moon";
import { ChalniProp } from "./ChalniProp";
import { isActivateKey, localPoint, type InteractionProps } from "./types";

type Step = "to-moon" | "to-him" | "done";

/** Where his face sits in the frame (photos keep the face in the upper-middle third). */
const FACE = { x: 0.5, y: 0.35 };
const START = { x: 0.5, y: 0.7 };

function moonCenter(area: HTMLElement) {
  const disc = document.getElementById("moon-disc");
  const box = area.getBoundingClientRect();
  if (!disc) return { x: 0.68, y: 0.14, r: 0.1 };
  const rect = disc.getBoundingClientRect();
  return {
    x: (rect.left + rect.width / 2 - box.left) / box.width,
    y: (rect.top + rect.height / 2 - box.top) / box.height,
    r: rect.width / 2 / box.width,
  };
}

/** The player lifts the chalni to the moon, then lowers it to frame him. */
export function ChalniDrag({ active, completed, onActivity, onComplete, sfx }: InteractionProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(START);
  const [step, setStep] = useState<Step>("to-moon");
  const [snapping, setSnapping] = useState(false);
  const [dragging, setDragging] = useState(false);
  const stepRef = useRef<Step>("to-moon");
  stepRef.current = step;

  useEffect(() => {
    if (completed) {
      setStep("done");
      setPos(FACE);
    }
  }, [completed]);

  const advance = () => {
    const area = areaRef.current;
    if (!area) return;
    if (stepRef.current === "to-moon") {
      const moon = moonCenter(area);
      setSnapping(true);
      setPos({ x: moon.x, y: moon.y });
      setStep("to-him");
      setDragging(false);
      sfx("wind-chime");
      vibrate(20);
      window.dispatchEvent(new Event(MOON_SPARKLE_EVENT));
      window.setTimeout(() => setSnapping(false), 450);
    } else if (stepRef.current === "to-him") {
      setSnapping(true);
      setPos(FACE);
      setStep("done");
      setDragging(false);
      sfx("bell", 0.7);
      window.setTimeout(onComplete, 300);
    }
  };

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !active || stepRef.current === "done") return;
    const area = areaRef.current;
    if (!area) return;
    const p = localPoint(event, area);
    const next = { x: p.x / p.w, y: p.y / p.h };
    setPos(next);
    onActivity();
    if (stepRef.current === "to-moon") {
      const moon = moonCenter(area);
      const aspect = p.h / p.w;
      const dx = next.x - moon.x;
      const dy = (next.y - moon.y) * aspect;
      if (Math.hypot(dx, dy) < Math.max(0.09, moon.r * 1.1)) advance();
    } else if (next.y >= FACE.y - 0.04) {
      advance();
    }
  };

  const ready = active && step !== "done";

  return (
    <div
      ref={areaRef}
      className="interaction-area touch-none"
      role="button"
      tabIndex={ready ? 0 : -1}
      aria-label={
        step === "to-moon"
          ? "Chalni ko chaand tak le jao. Keyboard par Enter dabao."
          : "Ab chalni ko neeche unki taraf le jao. Keyboard par Enter dabao."
      }
      onPointerDown={(event) => {
        if (!ready) return;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Best effort.
        }
        setDragging(true);
        setSnapping(false);
        onActivity();
        move(event);
      }}
      onPointerMove={move}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(event) => {
        if (ready && isActivateKey(event)) {
          event.preventDefault();
          onActivity();
          advance();
        }
      }}
    >
      <div
        className={`chalni-drag ${snapping ? "is-snapping" : ""} ${step === "to-moon" ? "" : "is-framing"} ${step === "done" ? "is-done" : ""}`}
        style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
      >
        <ChalniProp />
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { isActivateKey } from "./types";

interface HoldOptions {
  active: boolean;
  /** Seconds of holding needed to complete. */
  seconds: number;
  /** Keep progress when released early (sip) or reset it (chalni look). */
  keepProgress: boolean;
  onStart?(): void;
  onRelease?(progress: number): void;
  onTick?(progress: number, dt: number): void;
  onComplete(): void;
}

/** Press-and-hold driven by pointer or Space/Enter, with a rAF progress loop. */
export function useHold(options: HoldOptions) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const holdingRef = useRef(false);
  const doneRef = useRef(false);
  const optsRef = useRef(options);
  optsRef.current = options;

  const start = useCallback(() => {
    if (!optsRef.current.active || doneRef.current || holdingRef.current) return;
    holdingRef.current = true;
    setHolding(true);
    optsRef.current.onStart?.();
  }, []);

  const end = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    if (doneRef.current) return;
    optsRef.current.onRelease?.(progressRef.current);
    if (!optsRef.current.keepProgress) {
      progressRef.current = 0;
      setProgress(0);
    }
  }, []);

  useEffect(() => {
    if (!holding) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!holdingRef.current || doneRef.current) return;
      progressRef.current = Math.min(1, progressRef.current + dt / optsRef.current.seconds);
      setProgress(progressRef.current);
      optsRef.current.onTick?.(progressRef.current, dt);
      if (progressRef.current >= 1) {
        doneRef.current = true;
        holdingRef.current = false;
        setHolding(false);
        optsRef.current.onComplete();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [holding]);

  useEffect(() => {
    if (!options.active) end();
  }, [options.active, end]);

  const bind = {
    onPointerDown: (event: React.PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      try {
        (event.currentTarget as Element).setPointerCapture(event.pointerId);
      } catch {
        // Capture is best effort.
      }
      start();
    },
    onPointerUp: end,
    onPointerCancel: end,
    onLostPointerCapture: end,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (isActivateKey(event) && !event.repeat) {
        event.preventDefault();
        start();
      }
    },
    onKeyUp: (event: React.KeyboardEvent) => {
      if (isActivateKey(event)) end();
    },
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
  };

  return { holding, progress, bind, done: doneRef.current };
}

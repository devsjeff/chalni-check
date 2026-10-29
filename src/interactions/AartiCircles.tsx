import { useEffect, useRef, useState } from "react";
import { vibrate } from "../engine/env";
import { DPR } from "../fx/quality";
import { Diya } from "../fx/Flames";
import { isActivateKey, localPoint, type InteractionProps } from "./types";

const NEEDED_SECONDS = 3;

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

/**
 * The player circles a finger clockwise; the diya leaves a sparkle trail,
 * a progress ring fills over ~3 s of circling, then a kumkum tilak glows.
 */
export function AartiCircles({ active, completed, reduced, onActivity, onComplete, sfx }: InteractionProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [flame, setFlame] = useState<{ x: number; y: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const points = useRef<{ x: number; y: number; t: number }[]>([]);
  const lastAngle = useRef<number | null>(null);
  const sparks = useRef<Spark[]>([]);
  const keyTimer = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = DPR();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.globalCompositeOperation = "lighter";
      sparks.current = sparks.current.filter((s) => s.life > 0);
      for (const spark of sparks.current) {
        spark.life -= dt * 1.4;
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        spark.vy -= 12 * dt;
        const a = Math.max(0, spark.life);
        const g = ctx.createRadialGradient(spark.x, spark.y, 0, spark.x, spark.y, 6);
        g.addColorStop(0, `rgba(255,236,180,${a})`);
        g.addColorStop(1, "rgba(255,180,84,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const complete = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    progressRef.current = 1;
    setProgress(1);
    setFlame(null);
    sfx("bell");
    window.setTimeout(() => sfx("bangles", 0.7), 350);
    vibrate([25, 60, 25]);
    onComplete();
  };

  const addProgress = (seconds: number) => {
    if (doneRef.current) return;
    progressRef.current = Math.min(1, progressRef.current + seconds / NEEDED_SECONDS);
    setProgress(progressRef.current);
    if (progressRef.current >= 1) complete();
  };

  const track = (x: number, y: number) => {
    const now = performance.now();
    const list = points.current;
    list.push({ x, y, t: now });
    while (list.length > 36) list.shift();
    if (!reduced) {
      for (let i = 0; i < 2; i += 1) {
        sparks.current.push({ x, y, vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50, life: 0.9 });
      }
    }
    if (list.length < 8) return;
    const cx = list.reduce((sum, p) => sum + p.x, 0) / list.length;
    const cy = list.reduce((sum, p) => sum + p.y, 0) / list.length;
    const radius = Math.hypot(x - cx, y - cy);
    const angle = Math.atan2(y - cy, x - cx);
    const prev = list[list.length - 2]!;
    const dt = (now - prev.t) / 1000;
    if (lastAngle.current !== null && radius > 18 && dt > 0 && dt < 0.2) {
      let delta = angle - lastAngle.current;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      const speed = Math.abs(delta) / dt;
      // Screen y grows downward, so a positive delta is clockwise.
      if (speed > 1.1) addProgress(delta > 0 ? dt : dt * 0.5);
    }
    lastAngle.current = angle;
  };

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!active || doneRef.current) return;
    if (event.pointerType === "mouse" && event.buttons === 0) return;
    const area = areaRef.current;
    if (!area) return;
    const p = localPoint(event, area);
    setFlame({ x: p.x, y: p.y });
    onActivity();
    track(p.x, p.y);
  };

  const stopKeys = () => {
    if (keyTimer.current !== null) window.clearInterval(keyTimer.current);
    keyTimer.current = null;
  };
  useEffect(() => stopKeys, []);

  const size = 128;
  const circumference = 2 * Math.PI * 54;

  return (
    <div
      ref={areaRef}
      className="interaction-area touch-none"
      role="button"
      tabIndex={active && !completed ? 0 : -1}
      aria-label="Aarti: ungli se gol-gol ghumao, ya Space dabaye rakho"
      onPointerDown={(event) => {
        if (!active) return;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Best effort.
        }
        points.current = [];
        lastAngle.current = null;
        onMove(event);
      }}
      onPointerMove={onMove}
      onPointerUp={() => setFlame(null)}
      onKeyDown={(event) => {
        if (!active || !isActivateKey(event) || event.repeat || keyTimer.current !== null) return;
        event.preventDefault();
        onActivity();
        keyTimer.current = window.setInterval(() => addProgress(0.05), 50);
      }}
      onKeyUp={stopKeys}
      onBlur={stopKeys}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {flame ? (
        <div className="aarti-flame" style={{ left: flame.x, top: flame.y }}>
          <Diya />
        </div>
      ) : null}
      {!completed && active ? (
        <svg className="aarti-ring" width={size} height={size} viewBox="0 0 128 128" aria-hidden="true">
          <circle cx="64" cy="64" r="54" className="hold-ring-track" />
          <circle
            cx="64"
            cy="64"
            r="54"
            className="hold-ring-fill"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
      ) : null}
      {completed || progress >= 1 ? (
        <div className="tilak" aria-hidden="true">
          <span className="tilak-dot" />
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="tilak-rice" style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

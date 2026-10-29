import { useEffect, useRef, useState } from "react";
import { CLOUD_LAYERS } from "../fx/Clouds";
import { DPR } from "../fx/quality";
import { isActivateKey, localPoint, type InteractionProps } from "./types";

const GRID_X = 18;
const GRID_Y = 14;
const CLEAR_TARGET = 0.55;
/** The wipeable sky covers the top 58 % of the stage. */
const REGION = 0.58;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Thick clouds over the moon; the player scratches them away with a finger. */
export function CloudWipe({ active, completed, reduced, onActivity, onComplete, sfx }: InteractionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Uint8Array>(new Uint8Array(GRID_X * GRID_Y));
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const doneRef = useRef(false);
  const [dissolving, setDissolving] = useState(false);
  const [cleared, setCleared] = useState(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let cancelled = false;
    const rect = canvas.getBoundingClientRect();
    const dpr = DPR();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width;
    const h = rect.height;

    // Soft puffs first so there is always cover, then turbulence texture on top.
    for (let i = 0; i < 46; i += 1) {
      const x = Math.random() * w;
      const y = Math.random() * h * 0.92;
      const r = w * (0.12 + Math.random() * 0.16);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const shade = 70 + Math.floor(Math.random() * 40);
      g.addColorStop(0, `rgba(${shade},${shade + 6},${shade + 34},0.95)`);
      g.addColorStop(1, `rgba(${shade},${shade + 6},${shade + 34},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    void Promise.all(CLOUD_LAYERS.map((layer) => loadImage(layer.src))).then((images) => {
      if (cancelled) return;
      ctx.globalCompositeOperation = "source-atop";
      images.forEach((img, index) => {
        if (!img) return;
        ctx.globalAlpha = 0.85 - index * 0.15;
        ctx.drawImage(img, -w * 0.25 + index * w * 0.1, -h * 0.1, w * 1.5, h * 1.2);
      });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDissolving(true);
    sfx("whoosh", 0.8);
    window.setTimeout(onComplete, reduced ? 200 : 900);
  };

  const markGrid = (x: number, y: number, w: number, h: number, radius: number) => {
    const grid = gridRef.current;
    const cellW = w / GRID_X;
    const cellH = h / GRID_Y;
    const reach = Math.ceil(radius / Math.min(cellW, cellH));
    const cx = Math.floor(x / cellW);
    const cy = Math.floor(y / cellH);
    for (let gy = cy - reach; gy <= cy + reach; gy += 1) {
      for (let gx = cx - reach; gx <= cx + reach; gx += 1) {
        if (gx < 0 || gy < 0 || gx >= GRID_X || gy >= GRID_Y) continue;
        const dx = (gx + 0.5) * cellW - x;
        const dy = (gy + 0.5) * cellH - y;
        if (dx * dx + dy * dy <= radius * radius) grid[gy * GRID_X + gx] = 1;
      }
    }
    let count = 0;
    for (let i = 0; i < grid.length; i += 1) count += grid[i]!;
    const ratio = count / grid.length;
    setCleared(ratio);
    if (ratio >= CLEAR_TARGET) finish();
  };

  const erase = (x: number, y: number, w: number, h: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const radius = w * 0.11;
    const from = lastRef.current ?? { x, y };
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (radius * 0.35)));
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 1; i <= steps; i += 1) {
      const px = from.x + ((x - from.x) * i) / steps;
      const py = from.y + ((y - from.y) * i) / steps;
      const g = ctx.createRadialGradient(px, py, 0, px, py, radius);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.6, "rgba(0,0,0,0.8)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
      markGrid(px, py, w, h, radius * 0.75);
    }
    ctx.globalCompositeOperation = "source-over";
    lastRef.current = { x, y };
  };

  const onPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeRef.current || doneRef.current) return;
    if (event.type === "pointermove" && event.buttons === 0 && event.pointerType === "mouse") {
      lastRef.current = null;
      return;
    }
    const p = localPoint(event, event.currentTarget);
    onActivity();
    erase(p.x, p.y, p.w, p.h);
  };

  // Keyboard alternative: holding Space wipes a sweeping path.
  const keyTimer = useRef<number | null>(null);
  const keySweep = useRef(0);
  const onKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!isActivateKey(event) || event.repeat || keyTimer.current !== null || !activeRef.current) return;
    event.preventDefault();
    const canvas = event.currentTarget;
    keyTimer.current = window.setInterval(() => {
      const rect = canvas.getBoundingClientRect();
      keySweep.current += 1;
      const t = keySweep.current / 14;
      const x = (0.5 + 0.42 * Math.sin(t * 2.3)) * rect.width;
      const y = ((t * 0.09) % 1) * rect.height;
      onActivity();
      erase(x, y, rect.width, rect.height);
    }, 40);
  };
  const stopKeys = () => {
    if (keyTimer.current !== null) window.clearInterval(keyTimer.current);
    keyTimer.current = null;
    lastRef.current = null;
  };
  useEffect(() => stopKeys, []);

  return (
    <div className={`cloud-wipe ${dissolving || completed ? "is-gone" : ""}`} style={{ height: `${REGION * 100}%` }}>
      <canvas
        ref={canvasRef}
        className="touch-none h-full w-full"
        tabIndex={active ? 0 : -1}
        role="button"
        aria-label="Baadal hatao: ungli se aasmaan ko ponchho, ya Space dabaye rakho"
        aria-valuenow={Math.round(cleared * 100)}
        onPointerDown={(e) => {
          lastRef.current = null;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // Best effort.
          }
          onPointer(e);
        }}
        onPointerMove={onPointer}
        onPointerUp={() => (lastRef.current = null)}
        onPointerCancel={() => (lastRef.current = null)}
        onKeyDown={onKeyDown}
        onKeyUp={stopKeys}
        onBlur={stopKeys}
      />
    </div>
  );
}

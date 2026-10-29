import { useEffect, useState } from "react";
import type { MoonState } from "../data/scenes";
import { imageIfPresent } from "../engine/assets";

export const MOON_SPARKLE_EVENT = "kc:moon-sparkle";

let proceduralMoon: string | null = null;

/** A believable full moon drawn once on a canvas, used until moon.webp exists. */
function drawProceduralMoon(): string {
  if (proceduralMoon) return proceduralMoon;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const c = size / 2;
  const r = size * 0.49;

  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.clip();

  const base = ctx.createRadialGradient(c * 0.82, c * 0.78, r * 0.1, c, c, r);
  base.addColorStop(0, "#FBF5E6");
  base.addColorStop(0.6, "#E9DFC8");
  base.addColorStop(1, "#BDB29A");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // Maria: large soft darker seas.
  const maria: [number, number, number][] = [
    [0.38, 0.34, 0.2],
    [0.58, 0.3, 0.14],
    [0.62, 0.5, 0.17],
    [0.42, 0.58, 0.12],
    [0.3, 0.48, 0.1],
    [0.7, 0.66, 0.09],
  ];
  for (const [mx, my, mr] of maria) {
    const g = ctx.createRadialGradient(mx * size, my * size, 0, mx * size, my * size, mr * size);
    g.addColorStop(0, "rgba(120,112,98,0.42)");
    g.addColorStop(0.7, "rgba(130,122,106,0.22)");
    g.addColorStop(1, "rgba(130,122,106,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mx * size, my * size, mr * size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Craters with a lit rim and shadowed floor.
  for (let i = 0; i < 90; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const cr = Math.pow(rand(), 2.4) * 20 + 1.5;
    ctx.fillStyle = `rgba(95,88,76,${0.1 + rand() * 0.16})`;
    ctx.beginPath();
    ctx.arc(x, y, cr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,252,240,${0.08 + rand() * 0.12})`;
    ctx.lineWidth = Math.max(0.6, cr * 0.18);
    ctx.beginPath();
    ctx.arc(x - cr * 0.12, y - cr * 0.12, cr, Math.PI * 0.9, Math.PI * 1.9);
    ctx.stroke();
  }

  // Fine grain.
  const grain = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < grain.data.length; i += 4) {
    const n = (rand() - 0.5) * 14;
    grain.data[i] = Math.min(255, Math.max(0, grain.data[i]! + n));
    grain.data[i + 1] = Math.min(255, Math.max(0, grain.data[i + 1]! + n));
    grain.data[i + 2] = Math.min(255, Math.max(0, grain.data[i + 2]! + n));
  }
  ctx.putImageData(grain, 0, 0);

  // Limb darkening.
  const limb = ctx.createRadialGradient(c, c, r * 0.55, c, c, r);
  limb.addColorStop(0, "rgba(0,0,0,0)");
  limb.addColorStop(1, "rgba(40,34,30,0.38)");
  ctx.fillStyle = limb;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  proceduralMoon = canvas.toDataURL("image/png");
  return proceduralMoon;
}

export function moonImageSrc(): string {
  return imageIfPresent("moon") ?? drawProceduralMoon();
}

/** Layer 2: the moon in a circular mask with screen-blended glow; halo breathes with --voice. */
export function Moon({ state }: { state: MoonState }) {
  const [src, setSrc] = useState<string>(() => imageIfPresent("moon") ?? "");
  const [sparkle, setSparkle] = useState(0);

  useEffect(() => {
    if (!src) setSrc(drawProceduralMoon());
  }, [src]);

  useEffect(() => {
    const onSparkle = () => setSparkle((n) => n + 1);
    window.addEventListener(MOON_SPARKLE_EVENT, onSparkle);
    return () => window.removeEventListener(MOON_SPARKLE_EVENT, onSparkle);
  }, []);

  return (
    <div className={`layer moon-layer moon-${state}`} aria-hidden="true">
      <div className="moon-anchor">
        <div className="moon-halo" />
        <div id="moon-disc" className="moon-disc">
          {src ? <img src={src} alt="" className="moon-img" draggable={false} /> : null}
          {src ? <img src={src} alt="" className="moon-bloom" draggable={false} /> : null}
        </div>
        {sparkle > 0 ? (
          <div key={sparkle} className="moon-sparkles">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} style={{ "--i": i } as React.CSSProperties} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

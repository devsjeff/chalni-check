import { useEffect, useRef } from "react";
import { DPR, getQuality, particleBudget, reportFrame, subscribeQuality } from "./quality";

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  speed: number;
  phase: number;
  warm: boolean;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

export const SHOOTING_STAR_EVENT = "kc:shooting-star";

export function launchShootingStar() {
  window.dispatchEvent(new Event(SHOOTING_STAR_EVENT));
}

function makeStars(count: number, dense: boolean): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i += 1) {
    const y = Math.pow(Math.random(), dense ? 1.1 : 1.6) * (dense ? 0.9 : 0.72);
    stars.push({
      x: Math.random(),
      y,
      r: Math.random() < 0.08 ? 1.5 + Math.random() : 0.5 + Math.random() * 0.8,
      base: 0.35 + Math.random() * 0.6,
      speed: 0.6 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      warm: Math.random() < 0.18,
    });
  }
  return stars;
}

/** Layer 1: twinkling stars, a rare shooting star, faint nebula (CSS behind). */
export function SkyCanvas({ dense = false }: { dense?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const denseRef = useRef(dense);
  denseRef.current = dense;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let raf = 0;
    let nextMeteor = performance.now() + 9000 + Math.random() * 14000;
    let lastDense = denseRef.current;

    const rebuild = () => {
      const count = Math.round(particleBudget() * (denseRef.current ? 1.6 : 1));
      stars = makeStars(count, denseRef.current);
      lastDense = denseRef.current;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = DPR();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = () => {
      const fromRight = Math.random() < 0.7;
      meteors.push({
        x: fromRight ? width * (0.55 + Math.random() * 0.4) : width * Math.random() * 0.4,
        y: height * (0.04 + Math.random() * 0.18),
        vx: (fromRight ? -1 : 1) * width * (0.9 + Math.random() * 0.4),
        vy: height * (0.28 + Math.random() * 0.12),
        life: 0,
        max: 0.9 + Math.random() * 0.4,
      });
    };

    const onShooting = () => spawn();

    let lastTime = performance.now();
    const draw = (now: number) => {
      reportFrame(now);
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      if (lastDense !== denseRef.current) rebuild();
      const reduced = getQuality() === "reduced";
      ctx.clearRect(0, 0, width, height);
      const t = now / 1000;
      for (const star of stars) {
        const twinkle = reduced ? 1 : 0.65 + 0.35 * Math.sin(t * star.speed + star.phase);
        ctx.globalAlpha = Math.min(1, star.base * twinkle * (denseRef.current ? 1.15 : 1));
        ctx.fillStyle = star.warm ? "#FFE2B0" : "#E8ECFF";
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!reduced && now > nextMeteor) {
        spawn();
        nextMeteor = now + 14000 + Math.random() * 18000;
      }
      meteors = meteors.filter((m) => m.life < m.max);
      for (const meteor of meteors) {
        meteor.life += dt;
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        const fade = Math.sin((meteor.life / meteor.max) * Math.PI);
        const tailX = meteor.x - meteor.vx * 0.16;
        const tailY = meteor.y - meteor.vy * 0.16;
        const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255,248,230,${0.95 * fade})`);
        gradient.addColorStop(1, "rgba(255,248,230,0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    rebuild();
    raf = requestAnimationFrame(draw);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener(SHOOTING_STAR_EVENT, onShooting);
    const unsubscribe = subscribeQuality(rebuild);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener(SHOOTING_STAR_EVENT, onShooting);
      unsubscribe();
    };
  }, []);

  return (
    <div className="layer sky" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

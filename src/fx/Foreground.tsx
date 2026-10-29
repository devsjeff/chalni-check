import { useEffect, useRef } from "react";
import { drawFireflies, makeFireflies, type Firefly } from "./Fireflies";
import { FairyLights } from "./Flames";
import { drawPetals, makePetals, type Petal } from "./Petals";
import { DPR, getQuality, particleBudget, subscribeQuality } from "./quality";

/** Layer 6: fairy lights, falling marigold petals and fireflies in one canvas loop. */
export function Foreground({ petals = true }: { petals?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef(petals);
  petalsRef.current = petals;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let width = 0;
    let height = 0;
    let petalList: Petal[] = [];
    let flies: Firefly[] = [];
    let raf = 0;
    let last = performance.now();

    const rebuild = () => {
      const budget = particleBudget();
      // Stars take the bulk of the budget; the foreground keeps it light.
      petalList = makePetals(Math.round(budget * 0.12), width, height);
      flies = makeFireflies(Math.round(budget * 0.14), width, height);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = DPR();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuild();
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, width, height);
      if (getQuality() !== "reduced") {
        const t = now / 1000;
        if (petalsRef.current) drawPetals(ctx, petalList, dt, t, width, height);
        drawFireflies(ctx, flies, dt, t, width, height);
      }
      raf = requestAnimationFrame(frame);
    };

    resize();
    raf = requestAnimationFrame(frame);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const unsubscribe = subscribeQuality(rebuild);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      unsubscribe();
    };
  }, []);

  return (
    <div className="layer foreground" aria-hidden="true">
      <FairyLights />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

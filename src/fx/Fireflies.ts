export interface Firefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
}

export function makeFireflies(count: number, width: number, height: number): Firefly[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: height * (0.35 + Math.random() * 0.55),
    vx: (Math.random() - 0.5) * 14,
    vy: (Math.random() - 0.5) * 10,
    phase: Math.random() * Math.PI * 2,
    speed: 0.6 + Math.random() * 1.4,
  }));
}

/** Slow, warm fireflies drifting through the lower half of the terrace. */
export function drawFireflies(ctx: CanvasRenderingContext2D, flies: Firefly[], dt: number, t: number, width: number, height: number) {
  ctx.globalCompositeOperation = "lighter";
  for (const fly of flies) {
    fly.vx += (Math.random() - 0.5) * 12 * dt;
    fly.vy += (Math.random() - 0.5) * 10 * dt;
    fly.vx = Math.max(-16, Math.min(16, fly.vx));
    fly.vy = Math.max(-12, Math.min(12, fly.vy));
    fly.x += fly.vx * dt;
    fly.y += fly.vy * dt;
    if (fly.x < -10) fly.x = width + 10;
    if (fly.x > width + 10) fly.x = -10;
    if (fly.y < height * 0.3) fly.vy += 6 * dt;
    if (fly.y > height * 0.95) fly.vy -= 6 * dt;
    const glow = Math.max(0, Math.sin(t * fly.speed + fly.phase));
    if (glow < 0.05) continue;
    const radius = 9 * glow + 2;
    const gradient = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, radius);
    gradient.addColorStop(0, `rgba(255,230,150,${0.85 * glow})`);
    gradient.addColorStop(1, "rgba(255,190,90,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(fly.x, fly.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

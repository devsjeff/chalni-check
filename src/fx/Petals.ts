export interface Petal {
  x: number;
  y: number;
  vy: number;
  sway: number;
  phase: number;
  spin: number;
  angle: number;
  size: number;
  hue: string;
}

const HUES = ["#F28C28", "#F7A531", "#E8701A", "#FFC34D"];

export function makePetals(count: number, width: number, height: number): Petal[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vy: 14 + Math.random() * 22,
    sway: 10 + Math.random() * 22,
    phase: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 2.4,
    angle: Math.random() * Math.PI * 2,
    size: 3 + Math.random() * 4,
    hue: HUES[Math.floor(Math.random() * HUES.length)] ?? "#F28C28",
  }));
}

/** Falling marigold petals. */
export function drawPetals(ctx: CanvasRenderingContext2D, petals: Petal[], dt: number, t: number, width: number, height: number) {
  for (const petal of petals) {
    petal.y += petal.vy * dt;
    petal.angle += petal.spin * dt;
    if (petal.y > height + 12) {
      petal.y = -12;
      petal.x = Math.random() * width;
    }
    const x = petal.x + Math.sin(t * 0.8 + petal.phase) * petal.sway;
    ctx.save();
    ctx.translate(x, petal.y);
    ctx.rotate(petal.angle);
    ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(t * 1.6 + petal.phase)));
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = petal.hue;
    ctx.beginPath();
    ctx.ellipse(0, 0, petal.size, petal.size * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

import type { Line } from "../data/script";
import { moonImageSrc } from "../fx/Moon";

const W = 1080;
const H = 1920;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load('italic 500 96px "Cormorant Garamond"'),
      document.fonts.load('500 64px "Cormorant Garamond"'),
      document.fonts.load('48px "Tiro Devanagari Hindi"', "करवा चौथ"),
      document.fonts.load('500 26px "Inter"'),
    ]);
  } catch {
    // Fall back to system serif if fonts are blocked.
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawCoverCircle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  r: number,
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const size = r * 2.12;
  const scale = Math.max(size / iw, size / ih);
  const w = iw * scale;
  const h = ih * scale;
  ctx.drawImage(img, cx - w / 2, cy - h / 2 - h * 0.06, w, h);
}

function drawChalniMesh(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = "rgba(217,164,65,0.38)";
  ctx.lineWidth = 2;
  const span = r * 2.4;
  for (let i = -span; i <= span; i += 16) {
    ctx.beginPath();
    ctx.moveTo(cx + i - r, cy - r);
    ctx.lineTo(cx + i + r, cy + r);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + i - r, cy + r);
    ctx.lineTo(cx + i + r, cy - r);
    ctx.stroke();
  }
  const hole = ctx.createRadialGradient(cx, cy, r * 0.42, cx, cy, r);
  hole.addColorStop(0, "rgba(7,10,26,0)");
  hole.addColorStop(0.55, "rgba(7,10,26,0.08)");
  hole.addColorStop(1, "rgba(7,10,26,0.45)");
  ctx.fillStyle = hole;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  ctx.strokeStyle = "rgba(217,164,65,0.95)";
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(193,18,31,0.75)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 16, 0, Math.PI * 2);
  ctx.stroke();
}

/** Draws the keepsake portrait PNG entirely in the browser. */
export async function drawKeepsake(
  name: string,
  closing: Line,
  selfieSrc?: string | null,
): Promise<Blob | null> {
  await ensureFonts();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#070A1A");
  sky.addColorStop(0.55, "#12163A");
  sky.addColorStop(1, "#4A0E2E");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 260; i += 1) {
    ctx.globalAlpha = 0.25 + rand() * 0.7;
    ctx.fillStyle = rand() < 0.2 ? "#FFE2B0" : "#E8ECFF";
    ctx.beginPath();
    ctx.arc(rand() * W, rand() * H * 0.75, rand() < 0.1 ? 2.6 : 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const mx = W / 2;
  const my = 640;
  const mr = 290;
  const glow = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 2.3);
  glow.addColorStop(0, "rgba(244,236,216,0.45)");
  glow.addColorStop(0.4, "rgba(255,180,84,0.12)");
  glow.addColorStop(1, "rgba(244,236,216,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const selfie = selfieSrc ? await loadImage(selfieSrc) : null;
  const moon = selfie ? null : await loadImage(moonImageSrc());
  ctx.save();
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.clip();
  if (selfie) {
    drawCoverCircle(ctx, selfie, mx, my, mr);
  } else if (moon) {
    ctx.drawImage(moon, mx - mr * 1.06, my - mr * 1.06, mr * 2.12, mr * 2.12);
  } else {
    ctx.fillStyle = "#F4ECD8";
    ctx.fill();
  }
  ctx.restore();
  if (selfie) drawChalniMesh(ctx, mx, my, mr);

  // Gold frame with a kumkum inner line.
  ctx.strokeStyle = "rgba(217,164,65,0.85)";
  ctx.lineWidth = 3;
  ctx.strokeRect(54, 54, W - 108, H - 108);
  ctx.strokeStyle = "rgba(193,18,31,0.6)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(70, 70, W - 140, H - 140);

  ctx.textAlign = "center";
  ctx.fillStyle = "#D9A441";
  ctx.font = 'italic 500 104px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(`Karva Chauth ${new Date().getFullYear()}`, W / 2, 1110);

  let y = 1110;
  if (name) {
    ctx.fillStyle = "#F4ECD8";
    ctx.font = '500 68px "Cormorant Garamond", Georgia, serif';
    y += 108;
    ctx.fillText(name, W / 2, y);
  }

  ctx.fillStyle = "rgba(244,236,216,0.95)";
  ctx.font = '50px "Tiro Devanagari Hindi", "Noto Sans Devanagari", serif';
  y += 120;
  for (const row of wrap(ctx, closing.hindi, 860)) {
    ctx.fillText(row, W / 2, y);
    y += 82;
  }

  ctx.fillStyle = "rgba(244,236,216,0.55)";
  ctx.font = 'italic 400 38px "Cormorant Garamond", Georgia, serif';
  y += 20;
  for (const row of wrap(ctx, closing.hinglish, 860)) {
    ctx.fillText(row, W / 2, y);
    y += 52;
  }

  // Two small diyas at the foot of the card.
  for (const dx of [-120, 120]) {
    const cx = W / 2 + dx;
    const cy = 1760;
    const g = ctx.createRadialGradient(cx, cy - 20, 0, cx, cy - 20, 90);
    g.addColorStop(0, "rgba(255,210,127,0.8)");
    g.addColorStop(1, "rgba(255,180,84,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - 100, cy - 120, 200, 200);
    ctx.fillStyle = "#8A5A1E";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 46, 14, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "#FFC15A";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 38);
    ctx.quadraticCurveTo(cx + 12, cy - 10, cx, cy + 4);
    ctx.quadraticCurveTo(cx - 12, cy - 10, cx, cy - 38);
    ctx.fill();
  }

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

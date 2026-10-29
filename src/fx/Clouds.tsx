import type { CloudState } from "../data/scenes";

/**
 * Cloud textures are SVG feTurbulence rendered once as images (no live filters),
 * so three parallax layers cost no more than three translated bitmaps.
 */
export function cloudSvg(seed: number, frequency: string, tint: string, density: number): string {
  const [r, g, b] = tint.split(",").map((v) => Number(v) / 255);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='520' viewBox='0 0 900 520'>
<defs>
<filter id='f' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='5' seed='${seed}'/>
<feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 ${density} ${-density * 0.42}'/>
</filter>
<radialGradient id='m' cx='50%' cy='50%' r='50%'><stop offset='55%' stop-color='white'/><stop offset='100%' stop-color='black'/></radialGradient>
<mask id='k'><rect width='900' height='520' fill='url(#m)'/></mask>
</defs>
<rect width='900' height='520' filter='url(#f)' mask='url(#k)'/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const CLOUD_LAYERS = [
  { src: cloudSvg(3, "0.004 0.009", "88,96,128", 3.1), className: "cloud cloud-a" },
  { src: cloudSvg(11, "0.006 0.013", "118,124,156", 2.8), className: "cloud cloud-b" },
  { src: cloudSvg(29, "0.008 0.016", "150,154,184", 2.4), className: "cloud cloud-c" },
];

/** Layer 3: drifting clouds over the moon. */
export function Clouds({ state }: { state: CloudState }) {
  return (
    <div className={`layer clouds clouds-${state}`} aria-hidden="true">
      {CLOUD_LAYERS.map((layer) => (
        <img key={layer.className} src={layer.src} alt="" className={layer.className} draggable={false} />
      ))}
    </div>
  );
}

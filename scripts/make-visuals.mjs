import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const dest = join(process.cwd(), "public", "assets", "img");
mkdirSync(dest, { recursive: true });

const moon = `
<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048">
  <defs>
    <radialGradient id="g" cx="42%" cy="40%" r="58%">
      <stop offset="0%" stop-color="#FBF5E6"/>
      <stop offset="55%" stop-color="#E8DCC4"/>
      <stop offset="100%" stop-color="#B8AD94"/>
    </radialGradient>
    <radialGradient id="m1" cx="38%" cy="34%" r="22%"><stop offset="0%" stop-color="#8C8474" stop-opacity="0.4"/><stop offset="100%" stop-color="#8C8474" stop-opacity="0"/></radialGradient>
    <radialGradient id="m2" cx="62%" cy="48%" r="18%"><stop offset="0%" stop-color="#7A7366" stop-opacity="0.35"/><stop offset="100%" stop-color="#7A7366" stop-opacity="0"/></radialGradient>
    <radialGradient id="limb" cx="50%" cy="50%" r="50%"><stop offset="70%" stop-color="white" stop-opacity="0"/><stop offset="100%" stop-color="#3A3228" stop-opacity="0.35"/></radialGradient>
  </defs>
  <rect width="2048" height="2048" fill="#000"/>
  <circle cx="1024" cy="1024" r="920" fill="url(#g)"/>
  <circle cx="1024" cy="1024" r="920" fill="url(#m1)"/>
  <circle cx="1024" cy="1024" r="920" fill="url(#m2)"/>
  <circle cx="780" cy="860" r="70" fill="#9A9180" opacity="0.28"/>
  <circle cx="1240" cy="700" r="48" fill="#8A8274" opacity="0.32"/>
  <circle cx="1180" cy="1180" r="90" fill="#7E7668" opacity="0.22"/>
  <circle cx="860" cy="1200" r="36" fill="#948C7C" opacity="0.3"/>
  <circle cx="1024" cy="1024" r="920" fill="url(#limb)"/>
</svg>`;

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#070A1A"/>
      <stop offset="70%" stop-color="#12163A"/>
      <stop offset="100%" stop-color="#4A0E2E"/>
    </linearGradient>
    <radialGradient id="halo" cx="62%" cy="38%" r="28%">
      <stop offset="0%" stop-color="#F4ECD8" stop-opacity="0.9"/>
      <stop offset="40%" stop-color="#FFB454" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#FFB454" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <circle cx="760" cy="240" r="240" fill="url(#halo)"/>
  <circle cx="760" cy="240" r="108" fill="#F4ECD8"/>
  <path d="M0 470 L80 430 L160 455 L250 400 L340 445 L430 390 L530 440 L620 405 L720 450 L810 410 L900 455 L990 420 L1080 450 L1200 410 L1200 630 L0 630 Z" fill="#0B0814"/>
  <ellipse cx="220" cy="540" rx="40" ry="12" fill="#8A5A1E"/>
  <path d="M220 538 C228 528 226 514 220 500 C214 514 212 528 220 538Z" fill="#FFB454"/>
  <ellipse cx="980" cy="545" rx="40" ry="12" fill="#8A5A1E"/>
  <path d="M980 543 C988 533 986 519 980 505 C974 519 972 533 980 543Z" fill="#FFB454"/>
</svg>`;

await sharp(Buffer.from(moon)).webp({ quality: 82 }).toFile(join(dest, "moon.webp"));
await sharp(Buffer.from(og)).jpeg({ quality: 84, mozjpeg: true }).toFile(join(dest, "og.jpg"));
writeFileSync(join(process.cwd(), "public", "assets", "img", ".gitkeep"), "");
console.log("Wrote moon.webp and og.jpg");

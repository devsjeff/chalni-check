import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.SHOT_URL || "http://127.0.0.1:4173";
mkdirSync("shots", { recursive: true });

const scenes = ["B1", "B2", "B3", "B4", "B5", "B6", "G1", "G2", "G3", "G4", "G5", "G6"];
const viewports = [
  { name: "iphone-13", width: 390, height: 844, scale: 2 },
  { name: "pixel-7", width: 412, height: 915, scale: 2 },
  { name: "desktop", width: 1280, height: 800, scale: 1 },
];

const browser = await chromium.launch();

for (const viewport of viewports) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.scale,
  });

  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `shots/${viewport.name}-gate.png` });

  for (const scene of scenes) {
    await page.goto(`${BASE}/?debug=1&scene=${scene}&name=Riya`, { waitUntil: "domcontentloaded" });
    const enter = page.getByRole("button", { name: /Tap karke andar aao/i });
    if (await enter.count()) await enter.click();
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `shots/${viewport.name}-${scene}.png` });
  }

  await page.close();
}

await browser.close();
console.log("Wrote screenshots to shots/");

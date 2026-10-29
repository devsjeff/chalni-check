import { mkdirSync, readdirSync, statSync } from "node:fs";
import { extname, join, parse } from "node:path";
import sharp from "sharp";

const SRC = join(process.cwd(), "assets-src");
const DEST = join(process.cwd(), "public", "assets", "img");
const ALLOWED = new Set([".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"]);

mkdirSync(DEST, { recursive: true });

let files = [];
try {
  files = readdirSync(SRC).filter((name) => ALLOWED.has(extname(name).toLowerCase()));
} catch {
  console.log("No assets-src folder yet. Drop photos there, then run npm run images.");
  process.exit(0);
}

for (const file of files) {
  const input = join(SRC, file);
  const name = parse(file).name;
  const square = name === "moon" || name.startsWith("prop-");
  const wide = name === "og";
  const pipeline = sharp(input).rotate();
  const resized = square
    ? pipeline.resize(2048, 2048, { fit: "cover" })
    : wide
      ? pipeline.resize(1200, 630, { fit: "cover" })
      : pipeline.resize(1080, 1920, { fit: "cover", withoutEnlargement: true });

  if (wide) {
    const dest = join(DEST, "og.jpg");
    await resized.jpeg({ quality: 82, mozjpeg: true }).toFile(dest);
    console.log(dest, `${Math.round(statSync(dest).size / 1024)} KB`);
  } else {
    const dest = join(DEST, `${name}.webp`);
    await resized.webp({ quality: 78 }).toFile(dest);
    console.log(dest, `${Math.round(statSync(dest).size / 1024)} KB`);
  }
}

import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const PUBLIC_DIR = join(process.cwd(), "public");
const MANIFEST_ID = "virtual:asset-manifest";
const RESOLVED_ID = "\0" + MANIFEST_ID;

function listPublicFiles(dir = PUBLIC_DIR): string[] {
  let out: string[] = [];
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) out = out.concat(listPublicFiles(full));
    else if (stats.size > 0) out.push("/" + relative(PUBLIC_DIR, full).split(sep).join("/"));
  }
  return out;
}

/**
 * Exposes the list of optional media that actually exists in public/.
 * The app only requests files on this list, so a missing photo, video or sound
 * never causes a 404 in the console; it silently uses the placeholder instead.
 */
function assetManifest(): Plugin {
  return {
    name: "asset-manifest",
    resolveId(id) {
      return id === MANIFEST_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const files = listPublicFiles().filter(
        (file) => file.startsWith("/assets/") || file.startsWith("/audio/"),
      );
      return `export default ${JSON.stringify(files)};`;
    },
    configureServer(server) {
      const refresh = (file: string) => {
        if (!file.startsWith(PUBLIC_DIR)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", refresh);
      server.watcher.on("unlink", refresh);
    },
  };
}

/** Absolute URLs for Open Graph tags so WhatsApp can fetch the preview image. */
function siteUrl(): Plugin {
  const host =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "";
  return {
    name: "site-url",
    transformIndexHtml(html) {
      return html.replaceAll("%SITE_URL%", host.replace(/\/$/, ""));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), assetManifest(), siteUrl()],
  build: {
    target: "es2020",
    assetsDir: "static",
  },
  server: { host: true },
});

import { copyFile, mkdir } from "node:fs/promises";

// Keep the official worker unbundled: Next/Turbopack rewrites its dynamic URL.
// .js also gives GitHub Pages the correct JavaScript MIME type for module workers.
const target = new URL("../public/vendor/", import.meta.url);
await mkdir(target, { recursive: true });
await copyFile(new URL("../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url), new URL("maplibre-gl-worker.js", target));
await copyFile(new URL("../node_modules/maplibre-gl/LICENSE.txt", import.meta.url), new URL("maplibre-LICENSE.txt", target));

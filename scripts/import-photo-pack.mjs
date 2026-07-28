import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

const packPath = process.argv[2];
if (!packPath) throw new Error("Usage: node scripts/import-photo-pack.mjs <photo-pack.zip>");

const root = process.cwd();
const zip = await JSZip.loadAsync(await fs.readFile(packPath));
const additions = JSON.parse(await zip.file("manifest.json").async("string"));
const manifestPath = path.join(root, "app/data/photo-manifest.json");
const current = JSON.parse(await fs.readFile(manifestPath, "utf8"));

for (const photo of additions) {
  const zipPath = `photos/${photo.journey}/${photo.id}.webp`;
  const entry = zip.file(zipPath);
  if (!entry) throw new Error(`Missing ${zipPath}`);
  const destination = path.join(root, "public", zipPath);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, await entry.async("nodebuffer"));
}

const existing = new Set(current.map((photo) => photo.id));
const merged = [...current, ...additions.filter((photo) => !existing.has(photo.id))];
await fs.writeFile(manifestPath, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`Imported ${additions.length} photos.`);

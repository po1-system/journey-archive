import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

const root = new URL("../out/", import.meta.url);
const prefix = "/journey-archive/";
const home = await readFile(new URL("index.html", root), "utf8");

test("lightweight Pages home retains the archive without activating immersive controls", () => {
  for (const text of ["水戸・大洗", "長野", "FEATURED JOURNEY", 'id="explore"', 'id="map"', 'id="rankings"']) {
    assert.ok(home.includes(text), "Missing home content: " + text);
  }
  assert.ok(!home.includes("Your site is taking shape"));
  for (const text of ["FLIGHT MODE", "ATLAS MODE", "<canvas"]) assert.ok(!home.includes(text));
});

test("Pages scripts and styles resolve under the repository subpath", async () => {
  const assets = [...home.matchAll(/(?:src|href)="(\/journey-archive\/_next\/[^"?]+)/g)].map(m => m[1]);
  assert.ok(assets.length > 0);
  assert.ok(!/(?:src|href)="\/_next\//.test(home));
  for (const asset of new Set(assets)) await access(new URL(asset.slice(prefix.length), root));
});

test("standalone worker and license are included, unchanged from the pinned package", async () => {
  const actual = await readFile(new URL("vendor/maplibre-gl-worker.js", root));
  const official = await readFile(new URL("../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url));
  assert.ok(actual.equals(official), "Export must contain the official standalone worker, not the main MapLibre module");
  const license = await readFile(new URL("vendor/maplibre-LICENSE.txt", root), "utf8");
  assert.ok(license.includes("Redistribution"));
});

test("3D source and worker fix are preserved but excluded from the app's client bundles", async () => {
  const chunks = new URL("_next/static/chunks/", root);
  const js = await Promise.all((await readdir(chunks)).filter(f => f.endsWith(".js")).map(f => readFile(new URL(f, chunks), "utf8")));
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const engine = await readFile(new URL("../app/components/immersive/map-engine.ts", import.meta.url), "utf8");
  assert.ok(engine.includes("/vendor/maplibre-gl-worker.js?v=" + pkg.dependencies["maplibre-gl"]));
  for (const marker of ["maplibre-gl-worker", "WebGLRenderer", "gibs.earthdata.nasa.gov", "seamlessphoto"]) assert.ok(!js.some(chunk => chunk.includes(marker)), "Heavy code should not be bundled: " + marker);
});

test("PWA manifest, Apple metadata and dedicated icons use the GitHub Pages scope", async () => {
  const manifest = JSON.parse(await readFile(new URL("manifest.webmanifest", root), "utf8"));
  assert.equal(manifest.display, "standalone"); assert.equal(manifest.start_url, prefix); assert.equal(manifest.scope, prefix);
  assert.equal(manifest.name, "Journey Archive");
  const iconSource = await readFile(new URL("../assets/pwa/kja-earth.png", import.meta.url));
  assert.deepEqual(manifest.icons.map(icon => icon.src), ["kja-earth-192.png", "kja-earth-512.png", "kja-earth-maskable-512.png"].map(name => prefix + "icons/" + name));
  for (const icon of manifest.icons) {
    assert.ok(icon.src.startsWith(prefix));
    const png = await readFile(new URL(icon.src.slice(prefix.length), root));
    const size = Number(icon.sizes.split("x")[0]); assert.equal(png.readUInt32BE(16), size); assert.equal(png.readUInt32BE(20), size);
  }
  assert.ok(home.includes('name="apple-mobile-web-app-capable" content="yes"'));
  assert.ok(home.includes('rel="apple-touch-icon"')); assert.ok(home.includes("viewport-fit=cover"));
  const apple = await readFile(new URL("icons/kja-earth-180.png", root));
  assert.equal(apple.readUInt32BE(16), 180); assert.equal(apple.readUInt32BE(20), 180);
  assert.ok(apple.equals(await sharp(iconSource).resize(180, 180).png().toBuffer()), "Apple icon must be the supplied artwork, without cropping");
  assert.ok(home.includes(prefix + "icons/kja-earth-180.png") && home.includes(prefix + "icons/kja-earth-32.png"));
  assert.ok(!home.includes("icons/journey-archive.svg") && !home.includes("icons/apple-touch-icon.png"));
  const maskable = await readFile(new URL("icons/kja-earth-maskable-512.png", root));
  assert.ok(maskable.equals(await sharp(iconSource).resize(384, 384).extend({ top: 64, bottom: 64, left: 64, right: 64, background: "#050607" }).png().toBuffer()));
  assert.ok(!home.includes("user-scalable=no"));
});

test("generated service worker precaches only an app shell, with scoped and bounded data", async () => {
  const sw = await readFile(new URL("sw.js", root), "utf8");
  const config = JSON.parse(sw.split("\n")[0].slice("self.JOURNEY_PWA = ".length, -1));
  assert.equal(config.base, prefix.slice(0, -1)); assert.equal(config.pages.length, 11);
  assert.match(config.version, /^[a-f0-9]{16}$/);
  let bytes = 0;
  for (const path of config.core) {
    assert.ok(path.startsWith(prefix));
    assert.ok(!/admin|vendor|journeys\/|\/images\//.test(path));
    bytes += (await readFile(new URL(path === prefix ? "index.html" : path.slice(prefix.length), root))).length;
  }
  assert.ok(bytes < 3 * 1024 * 1024);
  assert.ok(!config.assets.some(path => /vendor|\/images\/|\.mp4|\.jpg|\.webp/.test(path)));
  assert.ok(!config.assets.some(path => path.includes("assets/pwa/")), "Do not cache the large original icon artwork");
  assert.ok(home.includes('loading="lazy"'));
});

test("existing journey detail pages remain in the static export", async () => {
  const slugs = ["kagawa", "fukuoka", "hiroshima", "okinawa", "wakayama", "ishikawa", "hakodate", "mito-oarai", "nagano", "sapporo-otaru"];
  for (const slug of slugs) {
    const html = await readFile(new URL("journeys/" + slug + "/index.html", root), "utf8");
    assert.ok(html.includes("Journey Archive"), "Invalid detail page: " + slug);
    assert.ok(home.includes(prefix + "journeys/" + slug + "/"), "Missing journey link: " + slug);
  }
});

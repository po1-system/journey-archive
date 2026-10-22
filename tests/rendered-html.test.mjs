import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../out/", import.meta.url);
const prefix = "/journey-archive/";
const home = await readFile(new URL("index.html", root), "utf8");

test("Pages export retains the immersive controls and existing archive", () => {
  for (const text of ["FLIGHT MODE", "ATLAS MODE", "東京", "水戸・大洗", "長野", "FEATURED JOURNEY", 'id="explore"', 'id="map"', 'id="rankings"']) {
    assert.ok(home.includes(text), "Missing home content: " + text);
  }
  assert.ok(!home.includes("Your site is taking shape"));
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

test("built client explicitly references the standalone worker (Turbopack URL regression)", async () => {
  const chunks = new URL("_next/static/chunks/", root);
  const js = await Promise.all((await readdir(chunks)).filter(f => f.endsWith(".js")).map(f => readFile(new URL(f, chunks), "utf8")));
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(js.some(chunk => chunk.includes("/vendor/maplibre-gl-worker.js?v=" + pkg.dependencies["maplibre-gl"])), "Client must bypass MapLibre's import.meta worker discovery");
});

test("existing journey detail pages remain in the static export", async () => {
  const slugs = ["kagawa", "fukuoka", "hiroshima", "okinawa", "wakayama", "ishikawa", "hakodate", "mito-oarai", "nagano", "sapporo-otaru"];
  for (const slug of slugs) {
    const html = await readFile(new URL("journeys/" + slug + "/index.html", root), "utf8");
    assert.ok(html.includes("Journey Archive"), "Invalid detail page: " + slug);
    assert.ok(home.includes(prefix + "journeys/" + slug + "/"), "Missing journey link: " + slug);
  }
});

import { readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = new URL("../out/", import.meta.url);
const home = await readFile(new URL("index.html", root), "utf8");
const base = home.match(/(?:src|href)="([^" ]*)\/_next\/static\//)?.[1];
if (base === undefined || !base.startsWith("/")) throw Error("Missing GitHub Pages base path");
const walk = async (dir, prefix = "") => {
  const items = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = prefix + entry.name;
    if (entry.isDirectory()) items.push(...await walk(new URL(entry.name + "/", dir), path + "/"));
    else items.push(path);
  }
  return items;
};
const files = await walk(root);
const assets = files.filter(path => /^_next\/static\/.*\.(js|css|woff2?)$/.test(path) || /^icons\/[^/]+\.(png|svg)$/.test(path) || path === "manifest.webmanifest").map(path => `${base}/${path}`);
const pages = [`${base}/`, ...files.filter(path => /^journeys\/[^/]+\/index\.html$/.test(path)).map(path => `${base}/${path.slice(0, -10)}`)];
const homeAssets = [...home.matchAll(/(?:src|href)="([^"?]+)/g)].map(match => match[1]).filter(path => assets.includes(path));
const offline = `${base}/offline.html`;
const core = [...new Set([`${base}/`, offline, ...homeAssets, `${base}/manifest.webmanifest`, ...assets.filter(path => path.includes("/icons/"))])];
const worker = await readFile(new URL("pwa-worker.js", import.meta.url), "utf8");
const offlineHtml = `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0c0c0b"><title>オフライン — Journey Archive</title><style>body{margin:0;background:#0c0c0b;color:#eeeae2;font:16px/1.9 -apple-system,sans-serif;min-height:100svh;display:grid;place-items:center}main{max-width:540px;padding:32px}small{color:#bda77b;letter-spacing:.2em}h1{font:32px/1.4 Georgia,serif}a{display:inline-block;padding:14px 0;color:#bda77b}</style><main><small>JOURNEY ARCHIVE</small><h1>次の旅は、オンラインで。</h1><p>このページはまだ保存されていません。通信を戻してから開いてください。すでに開いた旅行ページとトップは、保存されていれば閲覧できます。写真・動画には通信が必要です。</p><a href="${base}/">アーカイブへ戻る →</a></main></html>`;
await writeFile(new URL("offline.html", root), offlineHtml);
const hash = createHash("sha256").update(worker).update(offlineHtml);
for (const file of files.filter(path => path.endsWith(".html") || assets.includes(`${base}/${path}`)).sort()) {
  hash.update(file).update(await readFile(new URL(file, root)));
}
const config = { base, prefix: `journey-archive-pwa-${base.replaceAll("/", "_")}-`, version: hash.digest("hex").slice(0, 16), core, assets, pages, offline };
await writeFile(new URL("sw.js", root), `self.JOURNEY_PWA = ${JSON.stringify(config)};\n${worker}`);
const coreBytes = (await Promise.all(core.map(path => readFile(new URL(path === `${base}/` ? "index.html" : path.slice(base.length + 1), root))))).reduce((sum, file) => sum + file.length, 0);
if (coreBytes > 3 * 1024 * 1024) throw Error(`Offline shell exceeds 3 MiB budget: ${coreBytes}`);
console.log(`PWA ${config.version}: ${pages.length} eligible pages; shell ${(coreBytes / 1024).toFixed(0)} KiB. No photos/maps/admin content cached.`);

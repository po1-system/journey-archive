import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../scripts/pwa-worker.js", import.meta.url), "utf8");
const origin = "https://po1-system.github.io", base = "/journey-archive";
const prefix = "journey-archive-pwa-_journey-archive-";
const config = { base, prefix, version: "test", core: [base + "/", base + "/offline.html", base + "/_next/static/home.js"], pages: [base + "/", base + "/journeys/nagano/", base + "/journeys/mito-oarai/"], assets: [base + "/_next/static/home.js", base + "/_next/static/detail.js"], offline: base + "/offline.html" };
const html = body => new Response(body, { headers: { "Content-Type": "text/html" } });
function harness() {
  const handlers = {}, stores = new Map(); let skip = 0, claims = 0;
  let network = async request => html(new URL(typeof request === "string" ? request : request.url).pathname);
  const key = request => typeof request === "string" ? request : request.url;
  const caches = {
    keys: async () => [...stores.keys()], delete: async name => stores.delete(name),
    open: async name => {
      if (!stores.has(name)) stores.set(name, new Map());
      const data = stores.get(name);
      return { keys: async () => [...data.keys()].map(url => new Request(url)), match: async request => data.get(key(request))?.clone(), delete: async request => data.delete(key(request)), put: async (request, response) => { data.set(key(request), response.clone()); } };
    },
  };
  const context = vm.createContext({ self: { JOURNEY_PWA: structuredClone(config), location: { origin }, addEventListener: (name, fn) => handlers[name] = fn, clients: { claim: async () => { claims++; } }, skipWaiting: async () => { skip++; } }, caches, fetch: (...args) => network(...args), Request, Response, Headers, URL, setTimeout, clearTimeout });
  vm.runInContext(source, context);
  return {
    context, stores, caches, setNetwork: value => network = value, get skip() { return skip; }, get claims() { return claims; },
    async dispatch(type, properties = {}) {
      const pending = []; let response;
      handlers[type]({ ...properties, waitUntil: promise => pending.push(promise), respondWith: promise => { response = promise; } });
      const result = response ? await response : undefined;
      await Promise.all(pending);
      return result;
    },
  };
}
const request = (path, extra = {}) => ({ url: new URL(path, origin).href, method: "GET", headers: new Headers(), mode: "navigate", referrer: "", ...extra });

test("PWA install waits for consent and activation only removes this app's old versions", async () => {
  const h = harness();
  await h.caches.open(prefix + "old-core"); await h.caches.open("another-app-core");
  await h.dispatch("install"); assert.equal(h.skip, 0);
  await h.dispatch("activate");
  assert.equal(h.claims, 1); assert.ok(h.stores.has("another-app-core")); assert.ok(!h.stores.has(prefix + "old-core"));
  await h.dispatch("message", { data: { type: "SKIP_WAITING" } }); assert.equal(h.skip, 1);
});

test("failed install is atomic and leaves the previous app intact", async () => {
  const h = harness(); await h.caches.open(prefix + "old-core");
  h.setNetwork(async () => { throw Error("network restricted"); });
  await assert.rejects(h.dispatch("install"), /network restricted/);
  assert.ok(h.stores.has(prefix + "old-core")); assert.ok(!h.stores.has(prefix + "test-core"));
});

test("network-first pages work online and fall back to visited pages or the offline shell", async () => {
  const h = harness(); await h.dispatch("install");
  const nagano = request(base + "/journeys/nagano/");
  h.setNetwork(async () => html("Fresh Nagano"));
  assert.equal(await (await h.dispatch("fetch", { request: nagano })).text(), "Fresh Nagano");
  h.setNetwork(async () => { throw Error("offline"); });
  assert.equal(await (await h.dispatch("fetch", { request: nagano })).text(), "Fresh Nagano");
  assert.equal(await (await h.dispatch("fetch", { request: request(base + "/journeys/mito-oarai/") })).text(), base + "/offline.html");
  assert.equal(await (await h.dispatch("fetch", { request: request(base + "/") })).text(), base + "/");
  // Coming back online must replace old HTML, not remain stuck on the fallback.
  h.setNetwork(async () => html("Updated after reconnect"));
  assert.equal(await (await h.dispatch("fetch", { request: nagano })).text(), "Updated after reconnect");
  const mito = request(base + "/journeys/mito-oarai/");
  assert.equal(await (await h.dispatch("fetch", { request: mito })).text(), "Updated after reconnect");
  h.setNetwork(async () => { throw Error("offline again"); });
  assert.equal(await (await h.dispatch("fetch", { request: nagano })).text(), "Updated after reconnect");
  assert.equal(await (await h.dispatch("fetch", { request: mito })).text(), "Updated after reconnect");
});

test("photos, video, tiles, admin, uploads, query/RSC and authenticated requests bypass caching", async () => {
  const h = harness();
  for (const value of [
    request("https://journey-archive-photo-publisher.po1-system.workers.dev/manifest"),
    request("https://images.unsplash.com/photo.jpg"), request("https://maps.gsi.go.jp/xyz/a.jpg"),
    request(base + "/images/hero/photo.jpg"), request(base + "/video.mp4"), request(base + "/vendor/maplibre-gl-worker.js"),
    request(base + "/admin/photos/"), request(base + "/?token=private"),
    request(base + "/", { method: "POST" }), request(base + "/", { headers: new Headers({ Authorization: "test" }) }),
    request(base + "/", { headers: new Headers({ RSC: "1" }) }), request(base + "/", { headers: new Headers({ Range: "bytes=0-5" }) }),
    request(base + "/_next/static/detail.js", { referrer: origin + base + "/admin/photos/" }),
    request("/other-repository/"),
  ]) assert.equal(await h.dispatch("fetch", { request: value }), undefined, value.url);
  assert.equal(h.stores.size, 0);
});

test("404, private, oversized, redirected or opaque responses cannot enter the cache", async () => {
  const h = harness();
  for (const response of [
    new Response("404", { status: 404 }), new Response("private", { headers: { "Content-Type": "text/html", "Cache-Control": "private" } }),
    new Response("secret", { headers: { "Content-Type": "text/html", "Cache-Control": "no-store" } }), html("x".repeat(1024 * 1024 + 1)),
  ]) {
    h.setNetwork(async () => response.clone());
    await h.dispatch("fetch", { request: request(base + "/journeys/nagano/") });
    assert.equal(h.stores.get(prefix + "test-pages")?.size ?? 0, 0);
  }
  assert.equal(vm.runInContext('cacheable({status:200,type:"opaque",headers:new Headers()},"asset")', h.context), false);
  assert.equal(vm.runInContext('cacheable({status:200,redirected:true,headers:new Headers()},"asset")', h.context), false);
});

test("runtime caches are bounded and clearing keeps the offline shell and other apps", async () => {
  const h = harness(); await h.dispatch("install"); await h.caches.open("other-app");
  await vm.runInContext('(async()=>{for(let i=0;i<24;i++) await boundedPut(pagesName, absolute(config.base+"/journeys/test"+i+"/"),new Response("page",{headers:{"Content-Type":"text/html"}}),"page");})()', h.context);
  assert.equal(h.stores.get(prefix + "test-pages").size, 20);
  let acknowledged = false;
  await h.dispatch("message", { data: { type: "CLEAR_RUNTIME" }, ports: [{ postMessage: () => acknowledged = true }] });
  assert.ok(acknowledged); assert.ok(h.stores.has(prefix + "test-core")); assert.ok(h.stores.has("other-app")); assert.ok(!h.stores.has(prefix + "test-pages"));
});

test("static app assets are reused offline; media is not in the allowlist", async () => {
  const h = harness(); await h.dispatch("install");
  h.setNetwork(async () => new Response("detail JS", { headers: { "Content-Type": "text/javascript" } }));
  const asset = request(base + "/_next/static/detail.js", { mode: "same-origin" });
  await h.dispatch("fetch", { request: asset });
  h.setNetwork(async () => { throw Error("offline"); });
  assert.equal(await (await h.dispatch("fetch", { request: asset })).text(), "detail JS");
});

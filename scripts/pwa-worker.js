/* Build prepends self.JOURNEY_PWA. No photo, map, upload or admin data is cached. */
const config = self.JOURNEY_PWA;
const coreName = `${config.prefix}${config.version}-core`;
const pagesName = `${config.prefix}${config.version}-pages`;
const assetsName = `${config.prefix}${config.version}-assets`;
const currentCaches = new Set([coreName, pagesName, assetsName]);
const absolute = path => new URL(path, self.location.origin).href;
const pagePaths = new Set(config.pages);
const assetPaths = new Set(config.assets);
const corePaths = new Set(config.core);
let writes = Promise.resolve();

function policy(request) {
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.search ||
      request.headers.has("Authorization") || request.headers.has("Range") || request.headers.has("RSC") ||
      (request.referrer && new URL(request.referrer).pathname.startsWith(`${config.base}/admin/`))) return null;
  const page = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  if (request.mode === "navigate" && pagePaths.has(page)) return { kind: "page", key: absolute(page) };
  if (assetPaths.has(url.pathname)) return { kind: "asset", key: url.href };
  return null;
}

function cacheable(response, kind) {
  const type = response.headers.get("Content-Type") ?? "";
  return response.status === 200 && response.type !== "opaque" && !response.redirected &&
    !/(no-store|private)/i.test(response.headers.get("Cache-Control") ?? "") &&
    response.headers.get("Vary") !== "*" &&
    (kind !== "page" || type.includes("text/html"));
}

async function boundedPut(name, key, response, kind) {
  if (!cacheable(response, kind)) return;
  const limit = kind === "page" ? 1024 * 1024 : 2 * 1024 * 1024;
  const bytes = (await response.clone().arrayBuffer()).byteLength;
  if (bytes > limit) return;
  const headers = new Headers(response.headers);
  headers.set("X-Journey-Cache-Bytes", String(bytes));
  const copy = new Response(await response.arrayBuffer(), { status: response.status, headers });
  writes = writes.catch(() => {}).then(async () => {
    const cache = await caches.open(name);
    await cache.delete(key);
    await cache.put(key, copy);
    const keys = await cache.keys();
    const sizes = await Promise.all(keys.map(async request => Number((await cache.match(request))?.headers.get("X-Journey-Cache-Bytes") ?? 0)));
    let total = sizes.reduce((sum, size) => sum + size, 0), remaining = keys.length;
    const maxBytes = kind === "page" ? 8 * 1024 * 1024 : 16 * 1024 * 1024;
    const maxEntries = kind === "page" ? 20 : 64;
    for (let i = 0; i < keys.length && (total > maxBytes || remaining > maxEntries); i++) {
      await cache.delete(keys[i]); total -= sizes[i]; remaining--;
    }
  });
  await writes;
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(coreName);
    // Atomic installation: a failed new version does not replace the active one.
    try {
      for (const path of config.core) {
        const response = await fetch(new Request(absolute(path), { cache: "reload", credentials: "omit" }));
        if (!cacheable(response, path.endsWith("/") || path.endsWith(".html") ? "page" : "asset")) throw Error("Cannot prepare offline shell");
        await cache.put(absolute(path), response);
      }
    } catch (error) { await caches.delete(coreName); throw error; }
    // An update waits until the user chooses to apply it.
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(config.prefix) && !currentCaches.has(name)) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

async function pageResponse(event, selected) {
  const cached = async () => (await caches.open(pagesName)).match(selected.key).then(async value => value ?? (await caches.open(coreName)).match(selected.key));
  const network = fetch(event.request);
  event.waitUntil(network.then(response => boundedPut(pagesName, selected.key, response.clone(), "page")).catch(() => {}));
  let timer;
  try {
    const response = await Promise.race([network, new Promise((_, reject) => { timer = setTimeout(() => reject(Error("Offline timeout")), 3500); })]);
    if (response.status < 500) return response;
    return await cached() ?? response;
  } catch {
    return await cached() ?? await (await caches.open(coreName)).match(absolute(config.offline)) ?? new Response("Offline", { status: 503 });
  } finally { clearTimeout(timer); }
}

self.addEventListener("fetch", event => {
  const selected = policy(event.request);
  if (!selected) return; // Browser network only: including every photo/video/map/API/admin request.
  if (selected.kind === "page") { event.respondWith(pageResponse(event, selected)); return; }
  event.respondWith((async () => {
    const core = corePaths.has(new URL(selected.key).pathname) ? await (await caches.open(coreName)).match(selected.key) : null;
    const saved = core ?? await (await caches.open(assetsName)).match(selected.key);
    if (saved) return saved;
    const response = await fetch(event.request);
    await boundedPut(assetsName, selected.key, response.clone(), "asset").catch(() => {});
    return response;
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
  if (event.data?.type === "CLEAR_RUNTIME") {
    event.waitUntil((async () => {
      await writes;
      await Promise.all([caches.delete(pagesName), caches.delete(assetsName)]);
      event.ports[0]?.postMessage({ cleared: true });
    })());
  }
});

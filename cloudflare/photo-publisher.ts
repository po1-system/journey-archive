interface Env {
  JOURNEY_PHOTOS: KVNamespace;
  ADMIN_KEY: string;
}

type PhotoRecord = {
  id: string;
  journey: string;
  day: number;
  place: string;
  takenAt?: string;
  src: string;
  caption?: string;
  placement?: string;
  rank?: number;
};

const allowedOrigins = new Set([
  "https://po1-system.github.io",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:8082",
]);

function cors(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://po1-system.github.io",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data: unknown, status = 200, origin: string | null = null, cacheControl?: string) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(cacheControl ? { "Cache-Control": cacheControl } : {}),
      ...cors(origin),
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });

    if (request.method === "GET" && url.pathname === "/manifest") {
      const manifest = await env.JOURNEY_PHOTOS.get<PhotoRecord[]>("manifest", "json") ?? [];
      return json(manifest, 200, origin, "no-store");
    }

    if (request.method === "GET" && url.pathname.startsWith("/photo/")) {
      const id = decodeURIComponent(url.pathname.slice("/photo/".length));
      const stored = await env.JOURNEY_PHOTOS.getWithMetadata<ArrayBuffer, { contentType?: string }>(`photo:${id}`, "arrayBuffer");
      if (!stored.value) return new Response("Not found", { status: 404, headers: cors(origin) });
      return new Response(stored.value, {
        headers: {
          "Content-Type": stored.metadata?.contentType ?? "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
          ...cors(origin),
        },
      });
    }

    if (request.method === "POST" && url.pathname === "/publish") {
      if (request.headers.get("Authorization") !== `Bearer ${env.ADMIN_KEY}`) {
        return json({ error: "管理パスコードが正しくありません。" }, 401, origin);
      }
      if (!origin || !allowedOrigins.has(origin)) return json({ error: "許可されていない画面です。" }, 403, origin);

      const form = await request.formData();
      const rawManifest = form.get("manifest");
      if (typeof rawManifest !== "string") return json({ error: "配置情報がありません。" }, 400, origin);
      const additions = JSON.parse(rawManifest) as PhotoRecord[];
      if (!Array.isArray(additions) || additions.length === 0 || additions.length > 50) {
        return json({ error: "一度に公開できる写真は1〜50枚です。" }, 400, origin);
      }

      for (const photo of additions) {
        const file = form.get(photo.id);
        if (!(file instanceof File) || file.size > 8_000_000) {
          return json({ error: `${photo.id}の画像がないか、サイズが大きすぎます。` }, 400, origin);
        }
        await env.JOURNEY_PHOTOS.put(`photo:${photo.id}`, await file.arrayBuffer(), {
          metadata: { contentType: file.type || "image/webp" },
        });
      }

      const current = await env.JOURNEY_PHOTOS.get<PhotoRecord[]>("manifest", "json") ?? [];
      const ids = new Set(additions.map((photo) => photo.id));
      await env.JOURNEY_PHOTOS.put("manifest", JSON.stringify([...current.filter((photo) => !ids.has(photo.id)), ...additions]));
      return json({ ok: true, published: additions.length }, 200, origin);
    }

    return json({ name: "Journey Archive Photo Publisher", status: "ok" }, 200, origin);
  },
};

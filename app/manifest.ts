import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export default function manifest(): MetadataRoute.Manifest {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return {
    id: `${base}/`, name: "Journey Archive", short_name: "Journey", lang: "ja",
    description: "まだ見ぬ景色求めて — 自分の旅を振り返る写真アーカイブ",
    start_url: `${base}/`, scope: `${base}/`, display: "standalone",
    background_color: "#0c0c0b", theme_color: "#0c0c0b",
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

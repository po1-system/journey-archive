// Only resize the existing Unsplash placeholders. Never proxy or rewrite the
// protected photo publisher, its signed URLs, or other photo origins.
export function photoSource(src: string, width: number, base = process.env.NEXT_PUBLIC_BASE_PATH ?? "") {
  if (src.startsWith("/") && !src.startsWith("//")) return `${base}${src}`;
  try {
    const url = new URL(src);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", "78");
      return url.href;
    }
  } catch { /* Keep existing unsupported URLs unchanged. */ }
  return src;
}

export function photoSrcSet(src: string) {
  if (!src.startsWith("https://images.unsplash.com/")) return undefined;
  return [640, 960, 1600].map(width => `${photoSource(src, width)} ${width}w`).join(", ");
}

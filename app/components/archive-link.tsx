import type { AnchorHTMLAttributes } from "react";

// Native document navigation: no speculative route downloads, and visited HTML
// can be restored by the service worker without caching Next's RSC responses.
export default function ArchiveLink({ href = "/", ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const internal = href.startsWith("/") && !href.startsWith("//");
  const [path, suffix = ""] = internal ? href.split(/(?=[?#])/, 2) : [href];
  const canonical = internal && !path.endsWith("/") && !path.split("/").at(-1)?.includes(".") ? `${path}/` : path;
  const target = internal ? `${base}${canonical}${suffix}` : href;
  return <a {...props} href={target} />;
}

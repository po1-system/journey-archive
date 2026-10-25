// Preview exactly the GitHub Pages export, including its repository subpath.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve("out"), prefix = "/journey-archive";
// This exact localhost origin is already allowed by the photo publisher.
const port = Number(process.env.JOURNEY_PREVIEW_PORT ?? 8082);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4" };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname === "/" || pathname === prefix) { res.writeHead(302, { Location: `${prefix}/` }); res.end(); return; }
    if (!pathname.startsWith(`${prefix}/`)) throw Error("Not found");
    let file = resolve(root, `.${pathname.slice(prefix.length)}`);
    if (!file.startsWith(`${root}${sep}`) && file !== root) throw Error("Not found");
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(port, "127.0.0.1", () => console.log(`Preview: http://localhost:${port}/journey-archive/`));

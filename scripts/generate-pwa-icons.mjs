// Size-only exports of the supplied artwork; no cropping or external service.
import sharp from "sharp";
const source = "assets/pwa/kja-earth.png";
for (const size of [32, 180, 192, 512]) {
  await sharp(source).resize(size, size).png().toFile(`public/icons/kja-earth-${size}.png`);
}
// Keep the monogram and aircraft inside the maskable safe area on other devices.
await sharp(source).resize(384, 384)
  .extend({ top: 64, bottom: 64, left: 64, right: 64, background: "#050607" })
  .png().toFile("public/icons/kja-earth-maskable-512.png");

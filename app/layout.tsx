import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./pwa.css";
import PwaClient from "./components/pwa-client";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0c0c0b", colorScheme: "dark" };

export const metadata: Metadata = {
  metadataBase: new URL("https://po1-system.github.io/journey-archive/"),
  title: "まだ見ぬ景色求めて — Journey Archive",
  description: "一人旅で出会った景色、食、移動、記憶を編む個人のためのデジタル旅行誌。",
  applicationName: "Journey Archive",
  manifest: `${base}/manifest.webmanifest`,
  appleWebApp: { capable: true, title: "Journey Archive", statusBarStyle: "black-translucent" },
  other: { "apple-mobile-web-app-capable": "yes" },
  icons: {
    icon: { url: `${base}/icons/kja-earth-32.png`, sizes: "32x32", type: "image/png" },
    apple: { url: `${base}/icons/kja-earth-180.png`, sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    title: "まだ見ぬ景色求めて — Journey Archive",
    description: "一人旅で出会った景色、食、移動、記憶を編む個人のためのデジタル旅行誌。",
    images: [{ url: "https://po1-system.github.io/journey-archive/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "まだ見ぬ景色求めて — Journey Archive",
    description: "一人旅で出会った景色、食、移動、記憶を編む個人のためのデジタル旅行誌。",
    images: ["https://po1-system.github.io/journey-archive/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}<PwaClient /></body>
    </html>
  );
}

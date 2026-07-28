import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://po1-system.github.io/journey-archive/"),
  title: "まだ見ぬ景色求めて — Journey Archive",
  description: "一人旅で出会った景色、食、移動、記憶を編む個人のためのデジタル旅行誌。",
  icons: { icon: "https://po1-system.github.io/journey-archive/favicon.svg" },
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
      <body>{children}</body>
    </html>
  );
}

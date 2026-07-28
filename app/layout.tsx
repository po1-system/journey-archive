import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "まだ見ぬ景色求めて — Journey Archive",
  description: "一人旅で出会った景色、食、移動、記憶を編む個人のためのデジタル旅行誌。",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "まだ見ぬ景色求めて — Journey Archive",
    description: "一人旅で出会った景色、食、移動、記憶を編む個人のためのデジタル旅行誌。",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "まだ見ぬ景色求めて — Journey Archive",
    description: "一人旅で出会った景色、食、移動、記憶を編む個人のためのデジタル旅行誌。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

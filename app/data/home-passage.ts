import { getJourneyImage } from "./site-images";

export type PassageScene = {
  slug: string;
  number: string;
  prefecture: string;
  title: string;
  date: string;
  duration: string;
  line: string;
  href: string;
  layers: {
    background: string;
    midground?: string;
    foreground?: string;
  };
  /** The next destination that starts appearing before this scene is left. */
  next?: {
    prefecture: string;
    title: string;
    date: string;
    image: string;
    isPlaceholder?: boolean;
  };
};

const mitoImage = getJourneyImage("mito-oarai").src
  ?? "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2600&q=88";

/**
 * Top-page passage scenes.
 *
 * Add a scene here to extend the scroll journey. A single `background` image is
 * enough: the component automatically reuses it for the midground/foreground
 * layers so the parallax still works before dedicated layer images are ready.
 */
export const homePassageScenes: PassageScene[] = [
  {
    slug: "mito-oarai",
    number: "08",
    prefecture: "茨城県",
    title: "水戸・大洗",
    date: "2026.07.27 — 07.28",
    duration: "1泊2日",
    line: "海と歴史、夕暮れの水戸へ。",
    href: "/journeys/mito-oarai",
    layers: { background: mitoImage },
    next: {
      prefecture: "長野県",
      title: "長野",
      date: "2026.08.17 — 08.18",
      // 長野の本人写真が届くまでの、遷移演出専用の山景色プレースホルダー。
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2600&q=88",
      isPlaceholder: true,
    },
  },
  {
    slug: "nagano",
    number: "09",
    prefecture: "長野県",
    title: "長野",
    date: "2026.08.17 — 08.18",
    duration: "1泊2日",
    line: "山の稜線へ、次の記憶をたどる。",
    href: "/journeys/nagano",
    // この写真はトップの遷移試作専用。旅行カードの代表写真は未設定のままです。
    layers: {
      background: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2600&q=88",
    },
  },
];

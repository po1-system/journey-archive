import { getJourneyImage } from "./site-images";

export type JourneyRouteStop = {
  slug: string;
  number: string;
  prefecture: string;
  title: string;
  date: string;
  duration: string;
  href: string;
  image: string;
  imageIsPlaceholder?: boolean;
};

const mitoImage = getJourneyImage("mito-oarai").src
  ?? "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2600&q=88";

/**
 * The first immersive route prototype.
 *
 * Add the next journey here when the Mito → Nagano experience is approved.
 * Each item becomes a 3D photo portal along one virtual route.
 */
export const journeyRoutePrototype: JourneyRouteStop[] = [
  {
    slug: "mito-oarai",
    number: "08",
    prefecture: "茨城県",
    title: "水戸・大洗",
    date: "2026.07.27 — 07.28",
    duration: "1泊2日",
    href: "/journeys/mito-oarai",
    image: mitoImage,
  },
  {
    slug: "nagano",
    number: "09",
    prefecture: "長野県",
    title: "長野",
    date: "2026.08.17 — 08.18",
    duration: "1泊2日",
    href: "/journeys/nagano",
    // この写真はトップの空間演出専用。旅行カードの代表写真は未設定のままです。
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2600&q=88",
    imageIsPlaceholder: true,
  },
];

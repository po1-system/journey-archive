import { journeys } from "./journeys";
import { mitoJourney } from "../archive-config";
import { getJourneyImage } from "./site-images";

export type JourneyRouteStop = {
  slug: string; number: string; title: string; english: string;
  prefecture: string; date: string; href: string; image: string | null;
  imageIsPlaceholder: boolean; longitude: number; latitude: number; anchor: string;
};

// WGS84 representative city locations, not recorded flight paths or hotel pins.
const anchors = [
  ["kagawa", "KAGAWA", 134.0466, 34.3428, "高松"],
  ["fukuoka", "FUKUOKA", 130.4017, 33.5902, "福岡"],
  ["hiroshima", "HIROSHIMA", 132.4553, 34.3853, "広島"],
  ["okinawa", "OKINAWA", 127.6792, 26.2124, "那覇"],
  ["wakayama", "WAKAYAMA", 135.344, 33.6781, "白浜"],
  ["ishikawa", "ISHIKAWA", 136.6562, 36.5613, "金沢"],
  ["hakodate", "HAKODATE", 140.7288, 41.7687, "函館"],
  ["mito-oarai", "MITO / OARAI", 140.4712, 36.3659, "水戸"],
  ["nagano", "NAGANO", 138.181, 36.6513, "長野"],
] as const;

export const journeyRoute: JourneyRouteStop[] = [
  { slug: "tokyo", number: "000", title: "東京", english: "TOKYO", prefecture: "東京都", date: "旅の出発点", href: "#journeys", image: null, imageIsPlaceholder: false, longitude: 139.7671, latitude: 35.6812, anchor: "東京" },
  ...anchors.map(([slug, english, longitude, latitude, anchor]) => {
    const journey = slug === "mito-oarai" ? mitoJourney : journeys.find((j) => j.slug === slug)!;
    const configured = getJourneyImage(slug).src;
    // Legacy stock photos may depict a different region. Use only configured
    // personal images here; published hero/best photos override these at runtime.
    const image = configured?.includes("images.unsplash.com") ? null : configured;
    return { slug, english, longitude, latitude, anchor, number: journey.number.padStart(3, "0"), title: journey.title, prefecture: journey.prefecture, date: journey.date, href: `/journeys/${slug}/`, image, imageIsPlaceholder: false };
  }),
];

import type { CinematicKind, JourneyStop } from "../components/cinematic-route";

type StopPreset = Omit<JourneyStop, "id">;
const presets: Record<string, {
  kind: CinematicKind;
  coordinates: [string, string];
  stops: StopPreset[];
}> = {
  kagawa: {
    kind: "places",
    coordinates: ["香川県", "訪問地域"],
    stops: [
      { number: "01", label: "三豊市", sublabel: "Confirmed place", tone: "day" },
      { number: "02", label: "高松市", sublabel: "Confirmed place", tone: "sunset" },
      { number: "03", label: "小豆島", sublabel: "Confirmed place", tone: "day" },
    ],
  },
  fukuoka: {
    kind: "route",
    coordinates: ["33.5904° N", "130.4017° E"],
    stops: [
      { number: "01", label: "福岡空港", sublabel: "09:30 · Arrival", tone: "dawn" },
      { number: "02", label: "博多旧市街", sublabel: "櫛田神社・東長寺", tone: "day" },
      { number: "03", label: "中洲", sublabel: "Day 1 · Evening", tone: "night" },
      { number: "04", label: "博多駅", sublabel: "Day 2", tone: "day" },
      { number: "05", label: "福岡空港", sublabel: "16:15 · Departure", tone: "sunset" },
    ],
  },
  hiroshima: {
    kind: "route",
    coordinates: ["34.3853° N", "132.4553° E"],
    stops: [
      { number: "01", label: "広島空港", sublabel: "09:47 · Arrival", tone: "dawn" },
      { number: "02", label: "宮島", sublabel: "12:21 · Arrival", tone: "day" },
      { number: "03", label: "広島市内", sublabel: "原爆ドーム・平和記念公園", tone: "sunset" },
      { number: "04", label: "広島城", sublabel: "Day 2", tone: "day" },
      { number: "05", label: "広島空港", sublabel: "17:10 · Departure", tone: "night" },
    ],
  },
  okinawa: {
    kind: "route",
    coordinates: ["26.2124° N", "127.6809° E"],
    stops: [
      { number: "01", label: "那覇空港", sublabel: "09:40 · Arrival", tone: "dawn" },
      { number: "02", label: "北谷", sublabel: "11:15 · Arrival", tone: "day" },
      { number: "03", label: "那覇", sublabel: "16:00 · Hotel", tone: "night" },
      { number: "04", label: "辻・国際通り", sublabel: "Day 2", tone: "day" },
      { number: "05", label: "那覇空港", sublabel: "18:20 · Departure", tone: "sunset" },
    ],
  },
  wakayama: {
    kind: "route",
    coordinates: ["和歌山県", "確認済み移動"],
    stops: [
      { number: "01", label: "南紀白浜", sublabel: "08:55 · Arrival", tone: "dawn" },
      { number: "02", label: "白浜・和歌山", sublabel: "Confirmed areas", tone: "day" },
      { number: "03", label: "白浜駅", sublabel: "16:20 · くろしお28号", tone: "sunset" },
      { number: "04", label: "新大阪", sublabel: "18:51 · Arrival", tone: "night" },
      { number: "05", label: "品川", sublabel: "21:30頃 · Arrival", tone: "night" },
    ],
  },
  ishikawa: {
    kind: "places",
    coordinates: ["石川県", "訪問地域"],
    stops: [
      { number: "01", label: "小松空港", sublabel: "10:30 · Arrival", tone: "dawn" },
      { number: "02", label: "金沢市", sublabel: "Confirmed place", tone: "day" },
      { number: "03", label: "小松市", sublabel: "Confirmed place", tone: "sunset" },
      { number: "04", label: "小松空港", sublabel: "18:35 · Departure", tone: "night" },
    ],
  },
  hakodate: {
    kind: "route",
    coordinates: ["41.7687° N", "140.7288° E"],
    stops: [
      { number: "01", label: "函館空港・駅", sublabel: "08:35 · Arrival", tone: "dawn" },
      { number: "02", label: "函館山", sublabel: "Day 1 · Sunset to night", tone: "sunset" },
      { number: "03", label: "朝市・五稜郭", sublabel: "Day 2 · Morning", tone: "dawn" },
      { number: "04", label: "元町・赤レンガ", sublabel: "Day 2 · Evening", tone: "night" },
      { number: "05", label: "修道院・空港", sublabel: "Day 3", tone: "day" },
    ],
  },
};

export function getCinematicPreset(slug: string) {
  const preset = presets[slug];
  if (!preset) return null;
  return {
    kind: preset.kind,
    coordinates: preset.coordinates,
    stops: preset.stops.map((stop, index) => ({ ...stop, id: `${slug}-stop-${index}` })),
  };
}

import type { JourneyStop } from "../components/cinematic-route";

type StopPreset = Omit<JourneyStop, "id">;

const presets: Record<string, { coordinates: [string, string]; stops: StopPreset[] }> = {
  kagawa: {
    coordinates: ["34.3401° N", "134.0434° E"],
    stops: [
      { number: "01", label: "東京", sublabel: "Journey Begins", tone: "dawn" },
      { number: "02", label: "三豊", sublabel: "Setouchi Light", tone: "day" },
      { number: "03", label: "高松", sublabel: "City & Sea", tone: "sunset" },
      { number: "04", label: "小豆島", sublabel: "Island Time", tone: "day" },
      { number: "05", label: "香川", sublabel: "Journey End", tone: "night" },
    ],
  },
  fukuoka: {
    coordinates: ["33.5904° N", "130.4017° E"],
    stops: [
      { number: "01", label: "羽田", sublabel: "07:30 · Departure", tone: "dawn" },
      { number: "02", label: "博多", sublabel: "Old Town", tone: "day" },
      { number: "03", label: "中洲", sublabel: "City Lights", tone: "night" },
      { number: "04", label: "福岡空港", sublabel: "Last Taste", tone: "day" },
      { number: "05", label: "福岡", sublabel: "Journey End", tone: "night" },
    ],
  },
  hiroshima: {
    coordinates: ["34.3853° N", "132.4553° E"],
    stops: [
      { number: "01", label: "広島空港", sublabel: "09:47 · Arrival", tone: "dawn" },
      { number: "02", label: "宮島", sublabel: "World Heritage", tone: "day" },
      { number: "03", label: "平和記念公園", sublabel: "Quiet Evening", tone: "sunset" },
      { number: "04", label: "広島城", sublabel: "History", tone: "day" },
      { number: "05", label: "広島", sublabel: "Journey End", tone: "night" },
    ],
  },
  okinawa: {
    coordinates: ["26.2124° N", "127.6809° E"],
    stops: [
      { number: "01", label: "那覇空港", sublabel: "09:40 · Arrival", tone: "dawn" },
      { number: "02", label: "北谷", sublabel: "Ocean & Color", tone: "day" },
      { number: "03", label: "那覇", sublabel: "Steak Night", tone: "night" },
      { number: "04", label: "国際通り", sublabel: "Last Walk", tone: "day" },
      { number: "05", label: "沖縄", sublabel: "Journey End", tone: "sunset" },
    ],
  },
  wakayama: {
    coordinates: ["33.6815° N", "135.3481° E"],
    stops: [
      { number: "01", label: "羽田", sublabel: "07:45 · Departure", tone: "dawn" },
      { number: "02", label: "白浜", sublabel: "Pacific Coast", tone: "day" },
      { number: "03", label: "和歌山", sublabel: "City Time", tone: "sunset" },
      { number: "04", label: "新大阪", sublabel: "Unexpected Route", tone: "night" },
      { number: "05", label: "品川", sublabel: "Journey End", tone: "night" },
    ],
  },
  ishikawa: {
    coordinates: ["36.5613° N", "136.6562° E"],
    stops: [
      { number: "01", label: "羽田", sublabel: "09:30 · Departure", tone: "dawn" },
      { number: "02", label: "小松", sublabel: "Gateway", tone: "day" },
      { number: "03", label: "金沢", sublabel: "Streets & Light", tone: "sunset" },
      { number: "04", label: "小松空港", sublabel: "Return", tone: "day" },
      { number: "05", label: "石川", sublabel: "Journey End", tone: "night" },
    ],
  },
  hakodate: {
    coordinates: ["41.7687° N", "140.7288° E"],
    stops: [
      { number: "01", label: "函館空港", sublabel: "08:35 · Arrival", tone: "dawn" },
      { number: "02", label: "函館山", sublabel: "Sunset to Night", tone: "sunset" },
      { number: "03", label: "函館朝市", sublabel: "Morning Taste", tone: "dawn" },
      { number: "04", label: "赤レンガ", sublabel: "Night Walk", tone: "night" },
      { number: "05", label: "函館", sublabel: "Journey End", tone: "night" },
    ],
  },
};

export function getCinematicPreset(slug: string) {
  const preset = presets[slug];
  if (!preset) return null;
  return {
    coordinates: preset.coordinates,
    stops: preset.stops.map((stop, index) => ({ ...stop, id: `${slug}-stop-${index}` })),
  };
}

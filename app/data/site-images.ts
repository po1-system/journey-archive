export type ImageAsset = {
  src: string | null;
  alt: string;
  label?: string;
};

/**
 * トップと旅行カードの画像設定。
 * 自分の写真を public/images/ 以下へ置き、このファイルの src だけ変えれば反映されます。
 */
export const homeHeroImages: ImageAsset[] = [
  { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=88", alt: "海辺に残る、旅の記憶", label: "海辺に残る、旅の記憶" },
  { src: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2400&q=88", alt: "静かな夕暮れを歩く", label: "静かな夕暮れを歩く" },
  { src: "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&w=2400&q=88", alt: "まだ見ぬ景色の先へ", label: "まだ見ぬ景色の先へ" },
  { src: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=2400&q=88", alt: "歴史と日常のあいだ", label: "歴史と日常のあいだ" },
];

export const journeyImages: Record<string, ImageAsset> = {
  kagawa: { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=88", alt: "香川旅行の代表写真" },
  fukuoka: { src: "https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?auto=format&fit=crop&w=2200&q=88", alt: "福岡旅行の代表写真" },
  hiroshima: { src: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=2200&q=88", alt: "広島旅行の代表写真" },
  okinawa: { src: "https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=2200&q=88", alt: "沖縄旅行の代表写真" },
  wakayama: { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=88", alt: "和歌山旅行の代表写真" },
  ishikawa: { src: "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&w=2200&q=88", alt: "石川旅行の代表写真" },
  hakodate: { src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2200&q=88", alt: "函館旅行の代表写真" },
  "mito-oarai": { src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=88", alt: "水戸・大洗旅行の代表写真" },
  // 写真が決まったら例: src: "/images/journeys/nagano.jpg" に置き換える。
  nagano: { src: null, alt: "長野旅行の代表写真は未設定" },
  "sapporo-otaru": { src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2200&q=88", alt: "札幌・小樽旅行の代表写真" },
};

export const featuredJourneySlug = "nagano";

export function getJourneyImage(slug: string): ImageAsset {
  return journeyImages[slug] ?? { src: null, alt: "旅の代表写真は未設定" };
}

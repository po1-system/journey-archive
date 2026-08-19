export type Journey = {
  slug: string;
  number: string;
  prefecture: string;
  title: string;
  area: string;
  date: string;
  duration: string;
  tagline: string;
  intro: string;
  transport: string[];
  hotel: string[];
  price: string;
  year: number;
  totalCost: number;
  status?: "planned";
  bestPhoto?: string;
  bestFood?: string;
  bestPlace?: string;
  days: { title: string; items: string[] }[];
  foods: { name: string; dish: string; price?: string }[];
  note?: string;
  image?: string;
};

export const journeys: Journey[] = [
  {
    slug: "kagawa",
    number: "01",
    prefecture: "香川県",
    title: "三豊・高松・小豆島",
    area: "三豊市・高松市・小豆島",
    date: "2025.11.17 — 11.19",
    duration: "2泊3日",
    tagline: "瀬戸内の光を追った、最初の一人旅。",
    intro: "Journey Archiveの始まりとなった香川への旅。三豊、高松、小豆島を巡り、瀬戸内の穏やかな風景を写真に残した。",
    transport: ["飛行機・現地公共交通"],
    hotel: ["香川県内｜2泊"],
    price: "予約費用合計 ¥43,540",
    year: 2025,
    totalCost: 43540,
    days: [
      { title: "瀬戸内を巡る", items: ["三豊市", "高松市", "小豆島"] },
    ],
    foods: [],
    note: "詳しい行程と食事は写真・記録との照合後に追加予定。",
  },
  {
    slug: "fukuoka",
    number: "02",
    prefecture: "福岡県",
    title: "福岡市",
    area: "福岡市",
    date: "2026.01.26 — 01.27",
    duration: "1泊2日",
    tagline: "仕事と旅が交差した、冬の博多。",
    intro: "朝一番の便で福岡へ。博多旧市街、中洲、福岡空港の食を巡った一泊二日。",
    transport: ["飛行機・地下鉄・徒歩"],
    hotel: ["福岡市内｜1泊"],
    price: "航空券＋ホテル ¥30,720",
    year: 2026,
    totalCost: 30720,
    bestFood: "ラーメン海鳴｜ラーメンジェノバ",
    bestPlace: "中洲",
    days: [
      { title: "Day 1｜博多旧市街から中洲の夜へ", items: ["ラーメン海鳴", "櫛田神社", "東長寺", "川端通商店街", "ウエスト 生そば春吉店", "中洲散歩"] },
      { title: "Day 2｜博多駅周辺を歩く", items: ["住吉神社", "喜水丸", "つばめの杜ひろば", "福岡空港"] },
    ],
    foods: [
      { name: "ラーメン海鳴", dish: "ラーメンジェノバ" },
      { name: "ウエスト 生そば春吉店", dish: "もつ鍋・塩ホルモン唐揚げ・牡蠣フライ・ざるうどん", price: "確認済み合計 ¥2,260" },
      { name: "博多の海鮮料理 喜水丸", dish: "海鮮料理・明太子" },
    ],
  },
  {
    slug: "hiroshima",
    number: "03",
    prefecture: "広島県",
    title: "広島市・宮島",
    area: "広島市・宮島",
    date: "2026.03.23 — 03.24",
    duration: "1泊2日",
    tagline: "世界遺産と平和、広島の食を巡る。",
    intro: "宮島では厳島神社と牡蠣を、市内では原爆ドーム、平和記念公園、広島城を巡った密度の高い二日間。",
    transport: ["飛行機・直通バス・フェリー・JR"],
    hotel: ["広島市内｜1泊"],
    price: "航空券＋ホテル ¥36,290",
    year: 2026,
    totalCost: 36290,
    bestFood: "牡蠣屋｜特選牡蠣屋定食",
    bestPlace: "厳島神社",
    days: [
      { title: "Day 1｜宮島から平和記念公園へ", items: ["紅葉堂", "厳島神社", "牡蠣屋", "宮島牡蠣カレーパン", "キング軒", "原爆ドーム", "平和記念公園"] },
      { title: "Day 2｜歴史を巡る朝", items: ["広島城", "月あかり", "広島空港"] },
    ],
    foods: [
      { name: "紅葉堂", dish: "揚げもみじ" },
      { name: "牡蠣屋", dish: "特選牡蠣屋定食", price: "¥3,500" },
      { name: "宮島", dish: "牡蠣カレーパン", price: "¥600" },
      { name: "キング軒", dish: "汁なし担々麺" },
      { name: "月あかり", dish: "あなごめし" },
    ],
  },
  {
    slug: "okinawa",
    number: "04",
    prefecture: "沖縄県",
    title: "那覇・北谷",
    area: "那覇市・北谷町",
    date: "2026.04.13 — 04.14",
    duration: "1泊2日",
    tagline: "異国情緒が漂う北谷と、南国の食。",
    intro: "那覇空港から北谷へ直行。アメリカンビレッジの景色と沖縄グルメを楽しみ、那覇の街を歩いた。",
    transport: ["飛行機・北谷ライナー・路線バス・ゆいレール・タクシー"],
    hotel: ["那覇市内｜1泊"],
    price: "航空券＋ホテル ¥42,420",
    year: 2026,
    totalCost: 42420,
    bestFood: "すながわ製麺所｜スペシャルそば",
    bestPlace: "アメリカンビレッジ",
    days: [
      { title: "Day 1｜北谷と沖縄グルメ", items: ["すながわ製麺所", "アメリカンビレッジ", "BLUE SEAL", "コナズ珈琲", "ジャンボステーキ ハンズ"] },
      { title: "Day 2｜那覇の街", items: ["辻エリア", "A&W 国際通り松尾店", "那覇空港"] },
    ],
    foods: [
      { name: "すながわ製麺所", dish: "スペシャルそば", price: "¥1,280" },
      { name: "BLUE SEAL", dish: "塩ちんすこうアイス", price: "¥470" },
      { name: "コナズ珈琲", dish: "ティラミスパンケーキ・アイスカフェラテ", price: "¥2,464" },
      { name: "ジャンボステーキ ハンズ", dish: "ステーキ", price: "¥4,620" },
      { name: "A&W", dish: "カーリーポテトフライ", price: "¥580" },
      { name: "ロイヤルスナックコート", dish: "ソーメンチャンプル", price: "¥1,738" },
    ],
  },
  {
    slug: "wakayama",
    number: "05",
    prefecture: "和歌山県",
    title: "白浜・和歌山市",
    area: "白浜町・和歌山市",
    date: "2026.04.20 — 04.21",
    duration: "1泊2日",
    tagline: "海辺の町と、予定外の帰路。",
    intro: "羽田から南紀白浜へ。帰路の航空便が運航中止となり、特急くろしおと東海道新幹線を乗り継いで東京へ戻った。",
    transport: ["飛行機・特急くろしお・東海道新幹線", "復路の航空便運航中止により鉄道へ変更"],
    hotel: ["白浜町内｜1泊"],
    price: "予約 ¥44,510・返金 ¥14,740・差引 ¥29,770",
    year: 2026,
    totalCost: 29770,
    days: [{ title: "予定から実績へ", items: ["白浜町", "和歌山市", "航空便運航中止", "鉄道へ切り替えて帰京"] }],
    foods: [],
    note: "詳細な訪問スポットと食事は記録照合後に追加予定。",
  },
  {
    slug: "ishikawa",
    number: "06",
    prefecture: "石川県",
    title: "金沢・小松",
    area: "金沢市・小松市",
    date: "2026.05.11 — 05.12",
    duration: "1泊2日",
    tagline: "北陸の街を歩く、初夏の二日間。",
    intro: "羽田から小松へ飛び、金沢と小松を巡った一泊二日。詳しい行程は写真と当時の記録を照合しながら育てていく。",
    transport: ["飛行機・現地公共交通"],
    hotel: ["金沢市内｜1泊"],
    price: "航空券＋ホテル ¥27,610",
    year: 2026,
    totalCost: 27610,
    days: [{ title: "金沢と小松", items: ["金沢市", "小松市"] }],
    foods: [],
    note: "詳しい行程・訪問地・食事は写真と記録の照合後に追加予定。",
  },
  {
    slug: "hakodate",
    number: "07",
    prefecture: "北海道",
    title: "函館",
    area: "函館市",
    date: "2026.06.15 — 06.17",
    duration: "2泊3日",
    tagline: "夕景から夜景へ、光を待つ旅。",
    intro: "函館山の夕景と夜景を中心に、朝市、五稜郭、元町、赤レンガ倉庫を巡った二泊三日。写真を撮る時間そのものが旅の主役になった。",
    transport: ["飛行機・空港連絡バス・市電・路線バス"],
    hotel: ["函館駅周辺｜2泊"],
    price: "航空券＋ホテル ¥43,340",
    year: 2026,
    totalCost: 43340,
    bestPhoto: "函館山の夕景と夜景",
    bestFood: "箱館ジンギスカン本店",
    bestPlace: "函館山",
    days: [
      { title: "Day 1｜函館山の光", items: ["函館駅", "十字街", "ラッキーピエロ", "函館山", "夕焼けから夜景のタイムラプス", "箱館ジンギスカン本店"] },
      { title: "Day 2｜朝市から赤レンガへ", items: ["味処 茶夢", "五稜郭タワー", "外国人墓地", "旧ロシア領事館", "競馬場前", "赤レンガ倉庫", "回転寿司"] },
      { title: "Day 3｜旅の余白", items: ["トラピスチヌ修道院", "函館空港", "お土産と地酒"] },
    ],
    foods: [
      { name: "ラッキーピエロ", dish: "函館のローカルフード" },
      { name: "箱館ジンギスカン本店", dish: "ジンギスカン" },
      { name: "味処 茶夢", dish: "函館朝市の朝食" },
      { name: "函館市内", dish: "回転寿司" },
    ],
    note: "湯の川はキャンセル。市電・バス乗り放題券は未購入。",
  },
  {
    slug: "nagano",
    number: "09",
    prefecture: "長野県",
    title: "長野",
    area: "詳細を整理中",
    date: "2026.08.17 — 08.18",
    duration: "1泊2日",
    tagline: "次の景色へ向かう、夏の長野。",
    intro: "2026年8月に訪れた長野への旅。写真、行程、食の記録をこれからこのページへ加えていく。",
    transport: ["交通情報を整理中"],
    hotel: ["宿泊情報を整理中"],
    price: "費用を整理中",
    year: 2026,
    totalCost: 0,
    days: [],
    foods: [],
    note: "写真・訪問地・食事・費用を整理中です。",
  },
  {
    slug: "sapporo-otaru",
    number: "10",
    prefecture: "北海道",
    title: "札幌・小樽",
    area: "札幌市・小樽市",
    date: "2026.10.05 — 10.07",
    duration: "2泊3日",
    tagline: "北の街を歩く、秋の三日間。",
    intro: "2026年10月の札幌・小樽への旅。旅のあと、写真を中心にその時間をこのページへ編み直していく。",
    transport: ["交通情報を準備中"],
    hotel: ["宿泊情報を準備中"],
    price: "費用を準備中",
    year: 2026,
    totalCost: 0,
    status: "planned",
    days: [],
    foods: [],
    note: "予定の旅です。実施後、写真・訪問地・食事・費用を記録します。",
  },
];

export function getJourney(slug: string) {
  return journeys.find((journey) => journey.slug === slug);
}

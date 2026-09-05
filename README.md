# Journey Archive

## トップの「日本を飛ぶ旅」

東京 → 香川 → 福岡 → 広島 → 沖縄 → 和歌山 → 石川 → 函館 → 水戸・大洗 → 長野を、訪問順に飛行します。ホイール・トラックパッド・スマートフォンのスワイプで進み、逆スクロールで戻れます。画面下の地名から目的地を選択でき、「旅行一覧へスキップ」で通常のサイトへ移動できます。

日本の海岸線はNatural Earthの公開地理データです。沖縄も実際の位置にあり、地名・ルート・カメラは同じ緯度経度の投影を使います。地図は海岸線を簡略化したものです。立体的な厚みは演出であり、標高データではありません。線は旅行同士を訪問順に結ぶもので、実際の飛行経路や鉄道経路ではありません。「直線距離」は各旅行の代表都市間の大円距離です。

### 飛行中に表示する写真の変更

1. 既存の写真管理画面で、旅行の「Hero」または「Best」に写真を公開します。Heroを優先し、なければBestの最上位を使います。セルフィー・料理写真は自動流用しません。
2. ファイルで管理する場合は `public/images/journeys/nagano.jpg` などを置き、`app/data/site-images.ts` の `journeyImages.nagano.src` を `/images/journeys/nagano.jpg` にします。次回ビルド・公開で反映されます。

公開済み写真が最優先です。写真未設定時・読み込み失敗時には地名付きの写真追加枠を表示します。地域と一致しない既存のUnsplash仮素材は、この地図体験には使いません。

### 構造と軽量化

- `app/data/home-passage.ts`: 訪問順・代表都市のWGS84座標。日付・旅行名は既存旅行データから取得。
- `app/components/japan-flight-scene.ts`: Three.js地図・カメラ・写真プレーン。出発→広域飛行→接近→写真内の滞在→通過をつなぐ。
- `public/maps/japan-context.geojson`: 同梱海岸線データ（約39KB）。APIキー不要。出典は同フォルダのREADME参照。
- 写真は現在・前後の最大3旅行のみ保持。遠くの写真は破棄。モバイルはDPR上限1.25・テクスチャ最大1024px、PCは1.75・1600px。
- 画面外・非表示タブ・カメラ停止中には連続描画を停止。OSの「動きを減らす」、WebGL非対応、地図読み込み失敗では通常の旅一覧へ切り替え。
- GitHub Pagesのサブパスは `NEXT_PUBLIC_BASE_PATH` をビルド時に設定。地図・ローカル写真の両方に適用。

地理計算の確認: `node --experimental-strip-types --test tests/japan-flight.test.mjs`。

「まだ見ぬ景色求めて — Journey Archive」のGitHub Pages版です。

## トップページのヒーロー画像を変更する方法

トップの写真は `app/data/site-images.ts` の `homeHeroImages` で管理しています。ここに登録された順に、トップページでゆっくりフェード切り替えされます。写真を追加・削除しても、トップページのコンポーネント本体は編集不要です。

### 写真を追加する手順

1. 横長写真を `public/images/hero/` に置きます。
   - 例: `public/images/hero/hero-nagano.jpg`
   - おすすめ: 横幅2400px以上、16:9、JPEGまたはWebP
2. `app/data/site-images.ts` の `homeHeroImages` に1行追加します。

```ts
{ src: "/images/hero/hero-nagano.jpg", alt: "長野で撮影した写真", label: "夏の長野" },
```

3. GitHubへ反映すると、追加した写真も自動スライドに含まれます。コンポーネント本体を編集する必要はありません。

写真を減らすときは、同じ設定配列から該当行を削除するだけです。

## 各旅行先の代表写真を変更する方法

旅行カード・トップのFeatured Journey・旅行詳細ページの表紙は、すべて `app/data/site-images.ts` の `journeyImages` から読み込みます。

### 写真を変更する手順

1. 横長写真を `public/images/journeys/` に置きます。
   - 例: `public/images/journeys/nagano.jpg`
   - おすすめ: 横幅2200px以上、16:10または16:9、JPEGまたはWebP
2. `app/data/site-images.ts` の旅行名と同じ行の `src` を変更します。

```ts
nagano: { src: "/images/journeys/nagano.jpg", alt: "長野旅行の代表写真" },
```

3. GitHubへ反映すると、カード・Featured Journey・詳細ページに同じ写真が反映されます。

詳細ページの表紙もこの設定を使用します。旅行ページごとに別の画像パスを編集する必要はありません。

長野のように写真がまだない旅行は `src: null` のままにします。既存旅行の写真は流用せず、「PHOTO TO BE ADDED」のプレースホルダーが表示されます。

## 画像の置き場所早見表

| 目的 | フォルダ | 例のファイル名 | 設定するファイル |
| --- | --- | --- | --- |
| トップのスライド写真 | `public/images/hero/` | `hero-nagano.jpg` | `app/data/site-images.ts` の `homeHeroImages` |
| 旅行カード・詳細ページの代表写真 | `public/images/journeys/` | `nagano.jpg` | `app/data/site-images.ts` の `journeyImages` |

## 開発・公開

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm run build:pages`: GitHub Pages向けにビルド
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)

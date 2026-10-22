# Journey Archive

## Immersive Flight / Atlas

トップ上部は、実際の空撮・衛星画像を標高データに重ねた3D地形です。最初の試作区間は **東京 → 水戸・大洗 → 長野**。従来の写真スライド、FEATURED JOURNEY、旅行一覧・詳細ページはその下に残しています。

- **FLIGHT MODE**: ホイール・トラックパッド・スマートフォンの縦スワイプでカメラが前進。逆スクロールで同じ道を戻ります。画面下の地名で到着地点に移動できます。
- **ATLAS MODE**: ドラッグで移動、ホイール／ピンチで拡大。右ドラッグ／2本指操作で回転・傾斜。「日本全体」で俯瞰し、地名を選ぶとその場所へ飛行します。
- FLIGHTに戻ると、ATLASに入る前の飛行位置に滑らかに戻ります。「旅行一覧へ」でいつでも従来UIへ進めます。
- **Memory Portal**: 目的地の上空に旅行写真を立体配置。空撮から写真へ接近します。「旅の記録を開く」から既存詳細ページに移動できます。

地形は標高データを1.25倍に強調しています。Google Earthのような建物の3D写真測量モデルではありません。ルートは代表都市を結ぶ映像演出で、実際に利用した航空・鉄道路線ではありません。雲・光・霧・夏の色調も演出で、実際の天候・撮影日の空を再現するものではありません。

### 飛行中に表示する写真の変更

1. 既存の写真管理画面で、旅行の「Hero」または「Best」に写真を公開します。Hero → Best → Place → Day → Gallery → Selfieの順で1枚を選びます。料理写真・動画は対象外です。セルフィーは風景写真がない場合の最後の候補です（Best Shotランキングの分類は変更しません）。
2. ファイルで管理する場合は `public/images/journeys/nagano.jpg` などを置き、`app/data/site-images.ts` の `journeyImages.nagano.src` を `/images/journeys/nagano.jpg` にします。次回ビルド・公開で反映されます。

公開済み写真が最優先です。写真未設定時・読み込み失敗時には地名付きの写真追加枠を表示します。地域と一致しない既存のUnsplash仮素材は、この地図体験には使いません。

### 構造と軽量化

- `app/data/home-passage.ts`: 訪問順・代表都市のWGS84座標。日付・旅行名は既存旅行データから取得。
- `app/components/immersive/flight-model.ts`: 前後どちらにも再生できるカメラの経路・高度感・到着タイミング。
- `app/components/immersive/map-engine.ts`: MapLibre地形、FLIGHT/ATLAS切替、描画・入力制御。
- `app/components/immersive/memory-portal.ts`: 地図と同じカメラ・奥行きを使うThree.js写真プレーン。
- `app/components/immersive/map-style.ts`: 空撮・地形ソース、出典、霧・空の色。
- 写真テクスチャは現在表示する1枚だけ保持し、切替時に破棄。モバイルはDPR上限1.25・テクスチャ最大1024px、PCは1.75・1600px。地図タイルキャッシュは60／120枚を上限とします。
- 画面外・非表示タブ・カメラ停止中には連続描画を停止。OSの「動きを減らす」、WebGL非対応、地図読み込み失敗では通常の旅一覧へ切り替え。
- GitHub Pagesのサブパスは `NEXT_PUBLIC_BASE_PATH` をビルド時に設定。地図・ローカル写真の両方に適用。

飛行計算の確認: `node --experimental-strip-types --test tests/immersive-flight.test.mjs tests/japan-flight.test.mjs`。

### 地図の利用条件・APIキー・コスト（2026-10-20確認）

| 用途 | 採用サービス／ライブラリ | 条件 |
| --- | --- | --- |
| 3D地図エンジン | [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt) | BSD-3-Clause、APIキー不要 |
| 空撮・衛星画像 | [国土地理院・全国最新写真](https://maps.gsi.go.jp/development/ichiran.html) | 直接タイルを読み込む方式。出典リンクを地図に表示。[利用規約](https://maps.gsi.go.jp/help/termsofuse.html)に従う |
| 標高 | [Terrain Tiles / AWS Open Data](https://registry.opendata.aws/terrain-tiles/) | アカウント不要の公開配信。Mapzen、USGS SRTM/GMTED2010、NOAA ETOPO1を表示。[帰属条件](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) |

新しいAPIキー、クレジットカード、有料契約は設定していません。地図SDK自体に従量課金はなく、公開タイルを利用します。ただし外部配信の継続・速度・無制限利用を保証する構成ではありません。既存GitHub Pagesと写真配信の費用・上限は従来どおりです。大量アクセス時は配信元の条件を再確認してから有料サービス等への移行を検討してください。

画像はズームによって撮影年・解像度が異なり、最新の現地状況やリアルタイム映像ではありません。国土地理院画像の出典にはLandsat8 (GSI, TSIC, GEO Grid/AIST, USGS)、GEBCO、NASA/USGS LP DAAC等を含みます。地図右下と「地図・演出について」に出典を表示します。

閲覧時、ブラウザは地理院・AWSへ表示範囲のタイルを直接要求します。利用者の現在地は取得せず、非公開EXIF・予約情報も送信しません。写真は既存の公開済みデータだけを参照します。

### 検証時の注意

GitHub Pagesと同じ出力は `npm run build:pages` で生成します。公開写真の配信は本番ドメイン向けのため、localhostでは写真が準備中になる場合があります。CORS制限を緩めず、公開後にも確認してください。iPhoneサイズのブラウザ検証は実機SafariのGPU・メモリ・タッチ操作を保証しないため、実機確認の有無を別途記録します。

#### 地図処理ファイルとローカル確認

MapLibreのworkerは、Turbopackによる参照先の書き換えを避けるため、公式パッケージから `public/vendor/maplibre-gl-worker.js` へコピーし、地図作成前に明示的に指定しています。`npm run build:pages` の前処理がworkerとライセンスを自動コピーします。直接 `next build` だけを実行せず、このビルド手順を使用してください。生成ファイルはGit管理対象外です。

- `npm test`: 飛行計算8件 → Pages向けビルド → 静的出力5件を確認（公開はしません）。
- `npm run preview:pages`: ビルド済み出力を `http://127.0.0.1:3120/journey-archive/` で確認。
- [2026-10-23の検証記録](docs/flight-validation-2026-10-23.md): 確認済み操作と未確認項目。

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

# Journey Archive

## 現在の構成：軽量PWA（ローカル検証版）

**FLIGHT / ATLASは一時停止中です。** トップは写真スライドと既存の旅行アーカイブから始まります。MapLibre・Three.js・地形タイルは読み込みません。旅行データ、写真、詳細ページ、編集画面は維持しています。3Dのソース、テスト、出典は削除していません。

### iPhoneのホーム画面に追加する方法

公開承認・反映後、Safariで `https://po1-system.github.io/journey-archive/` を開きます。

1. Safariの「共有」を開く。
2. 「ホーム画面に追加」を選ぶ。
3. 「Webアプリとして開く」が表示される場合はオンにする。
4. 名前を確認して「追加」。専用の **KJA＋飛行機** アイコンから起動できます。

アプリ名は **Journey Archive**（短縮名 Journey）。スタンドアロンではブラウザのアドレスバーなしで開きます。公開サイトと同じoriginを使用し、写真配信制限を回避するプロキシや許可元の追加は行いません。Safariのバージョンによってメニュー名は異なります。ローカルのブラウザサイズ検証は、iPhone実機でのインストール・操作確認の代わりにはなりません。

### キャッシュと更新

- 初回はオンラインで開いてください。最初の画面が読み込まれた後、アプリの画面・JS・CSS・アイコンを保存します。フッターの「iPhoneのホーム画面に追加」を開き、「オフライン用の画面を保存済み」と出れば準備完了です。
- トップと一度開いた旅行ページは保存されていればオフラインでも読めます。未訪問ページには専用のオフライン案内を表示します。
- **写真・動画、写真API、地図タイル、管理画面、アップロード、EXIF入力はPWAのキャッシュ対象外です。** 写真・動画の表示と編集には通信が必要です。ブラウザ自身の通常のHTTPキャッシュは配信元の設定に従います。
- 保存したHTMLはオンライン時に毎回確認します。通信が失敗するか3.5秒以上応答がない場合は保存済みのページを表示します。
- アプリ用ファイルはビルド内容のハッシュで版管理。新しい版がある場合、「更新して開き直す」を選んで切り替えます。編集中の管理画面には更新ボタンを出さず、自動リロードもしません。他のタブも強制リロードしません。
- 専用キャッシュはこのリポジトリの `/journey-archive/` だけです。他のGitHub Pagesサイトのキャッシュは消しません。初期保存は3MiB以下、追加の閲覧ページは8MiB/20件、追加アセットは16MiB/64件以下に制限します。
- フッター内の「閲覧キャッシュを削除」は追加の閲覧キャッシュだけを削除します。起動用ファイル、写真、ローカル下書き、管理キーは削除しません。iOSが空き容量等の理由で保存内容を削除することはあります。バックアップ用途ではありません。

### 軽量化・タッチ対応

- ホームから3Dコンポーネントのimportを外し、3Dライブラリを公開ページのJSバンドルに含めません。復元用の公式workerファイルは出力内に残りますが、読み込みも事前キャッシュもしません。
- ヒーローは最初の写真を優先取得。次の写真は表示中のみ読み込みます。非表示タブ・画面外・省データ指定・「動きを減らす」では自動切り替えを停止します。
- 旅行一覧の写真は遅延読み込み。既存のUnsplash仮素材のみ画面幅に合わせたサイズで取得し、写真APIのURL・制限は変更しません。
- 主要なタッチ領域は44px以上。モバイルの入力欄は16px文字、safe areaを考慮。ピンチズームを禁止しません。
- 公開側の旅行リンクは通常のHTML遷移を使い、不要な先読みを抑え、保存したHTMLへのオフライン遷移を可能にしています。

### 実装ファイルとローカル確認

- `app/manifest.ts`：アプリ名・スコープ・起動URL。
- `public/icons/journey-archive.svg`：専用アイコン原稿。変更後 `npm run icons:generate` で180/192/512pxのPNGを再生成。
- `app/components/pwa-client.tsx`：起動後登録・更新確認・インストール案内。
- `scripts/pwa-worker.js`：キャッシュ方針。`npm run build:pages` の後処理が版番号・許可リスト付きの `out/sw.js` とオフライン画面を生成します。`out/` は直接編集しません。
- `npm test`：既存3Dの回帰テスト＋PWAテスト → Pagesビルド → 静的出力テスト。ローカル処理のみです。
- `npm run preview:pages` → **http://localhost:8082/journey-archive/**。写真配信が許可済みのoriginです。別originのために制限を緩和しないでください。
- 開発サーバーではService Workerを登録しません。PWAは上の本番形式プレビューで確認します。
- [2026-10-31のPWA検証記録](docs/pwa-validation-2026-10-31.md)：保存済み/未保存ページ、更新、通信復帰、24件のテスト、iPhone実機の未確認項目。

GitHubへのpush・公開はユーザー承認後に行います。以下の3D機能の説明は**再利用用に保存した仕様**です。復元する場合は `app/components/immersive` と `app/data/home-passage.ts` を使い、利用者が明示的に起動する画面などから読み込む方式を別途検討してください。

仕様参照：[Next.js PWAガイド](https://nextjs.org/docs/app/guides/progressive-web-apps)、[MDN Service Workerのライフサイクル](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)。

## Immersive Flight / Atlas（停止中・保存済み仕様）

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

### 地図の利用条件・APIキー・コスト（画像レイヤーは2026-10-24再確認）

| 用途 | 採用サービス／ライブラリ | 条件 |
| --- | --- | --- |
| 3D地図エンジン | [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt) | BSD-3-Clause、APIキー不要 |
| 広域の衛星画像 | [NASA GIBS・Blue Marble](https://nasa-gibs.github.io/gibs-api-docs/) | 公開WMTS、キー・ログイン不要。NASA GIBS / ESDISの出典リンクを表示。ネイティブのズームは0〜8 |
| 空撮・衛星画像 | [国土地理院・全国最新写真](https://maps.gsi.go.jp/development/ichiran.html) | 直接タイルを読み込む方式。出典リンクを地図に表示。[利用規約](https://maps.gsi.go.jp/help/termsofuse.html)に従う |
| 標高 | [Terrain Tiles / AWS Open Data](https://registry.opendata.aws/terrain-tiles/) | アカウント不要の公開配信。Mapzen、USGS SRTM/GMTED2010、NOAA ETOPO1を表示。[帰属条件](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) |

新しいAPIキー、クレジットカード、有料契約は設定していません。地図SDK自体に従量課金はなく、公開タイルを利用します。ただし外部配信の継続・速度・無制限利用を保証する構成ではありません。既存GitHub Pagesと写真配信の費用・上限は従来どおりです。大量アクセス時は配信元の条件を再確認してから有料サービス等への移行を検討してください。

広域はNASA Blue Marble、ズーム9〜10.5で国土地理院の写真へ連続的に重ね替えます。広域画像を不透明な下地に残すため、切り替え途中で背景色が透けません。写真が全面表示になるズーム11以降は広域レイヤーを停止します。地形、カメラ、FLIGHT/ATLASの操作は共通です。

国土地理院 `seamlessphoto` のズーム2〜8（世界衛星モザイク）には元画像に灰色の三角形があるため使用しません。同院の `lndst` も比較しましたが、日本国外の陸域が白くなるため採用しませんでした。写真ソース自体の最小ズームを9に制限し、遠景用に低解像度タイルが選ばれても問題の画像を取得しない設定です。

画像はズームによって撮影年・解像度が異なり、最新の現地状況やリアルタイム映像ではありません。国土地理院画像の出典にはLandsat8 (GSI, TSIC, GEO Grid/AIST, USGS)、GEBCO、GRUS画像 (© Axelspace) を含みます。地図右下と「地図・演出について」に出典を表示します。

NASA GIBS acknowledgement: We acknowledge the use of imagery provided by services from NASA's Global Imagery Browse Services (GIBS), part of NASA's Earth Science Data and Information System (ESDIS).

閲覧時、ブラウザはNASA GIBS・地理院・AWSへ表示範囲のタイルを直接要求します。利用者の現在地は取得せず、非公開EXIF・予約情報も送信しません。写真は既存の公開済みデータだけを参照します。

### 検証時の注意

GitHub Pagesと同じ出力は `npm run build:pages` で生成します。公開写真は既に許可済みの `http://localhost:8082` で確認できます。`127.0.0.1` や別ポートは別のoriginとして扱われるため、写真が準備中になることがあります。CORS制限を緩めたりプロキシで回避せず、下記URLを使用してください。iPhoneサイズのブラウザ検証は実機SafariのGPU・メモリ・タッチ操作を保証しないため、実機確認の有無を別途記録します。

#### 地図処理ファイルとローカル確認

MapLibreのworkerは、Turbopackによる参照先の書き換えを避けるため、公式パッケージから `public/vendor/maplibre-gl-worker.js` へコピーし、地図作成前に明示的に指定しています。`npm run build:pages` の前処理がworkerとライセンスを自動コピーします。直接 `next build` だけを実行せず、このビルド手順を使用してください。生成ファイルはGit管理対象外です。

- `npm test`: 飛行・地図スタイル10件＋PWA動作7件 → Pages向けビルド → 静的出力7件の計24件を確認（公開はしません）。
- `npm run preview:pages`: ビルド済み出力を `http://localhost:8082/journey-archive/` で確認。ローカル端末だけで接続できます。別ポートは `JOURNEY_PREVIEW_PORT` で指定できますが、写真配信の許可元は変わりません。
- [2026-10-23の検証記録](docs/flight-validation-2026-10-23.md): 確認済み操作と未確認項目。
- [2026-10-25の最終検証記録](docs/atlas-validation-2026-10-25.md): 広域画像の欠け対策、航空写真への切り替え、実写真とスマートフォン幅の確認。

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

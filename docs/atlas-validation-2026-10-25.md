# ATLAS / FLIGHT 最終検証 — 2026-10-25

## 対象と修正

基準コミット: `771b05b`。前回の未コミット変更を維持して最終確認。

ATLAS右上の灰色の三角形は、国土地理院の世界衛星モザイク画像そのものに含まれる。
写真プレーンと3D地形をそれぞれ外した切り分けでも残り、原画像
`https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/5/28/12.jpg` で同じ形を確認した。
切り分け用の無効化はすべて取り除き、既存の写真プレーン・地形（起伏1.25倍）・カメラ処理を維持している。

- 広域: NASA GIBS Blue Marble（native zoom 0–8、WMTSのURL順はz/y/x）。
- 接近: 国土地理院 seamlessphoto をzoom 9以上のみ取得。opacityをzoom 9の0から10.5の1へ連続変化。
- 広域画像は重ね替え中も不透明な下地として維持。zoom 11以降は広域レイヤーを停止。
- 読み込み準備判定は広域／航空写真のどちらの画像取得でも進む。
- GSI `lndst` は日本外の陸域が白くなるため不採用。
- localhostプレビューの既定URLを、既に写真配信に許可されている `http://localhost:8082/journey-archive/` に統一。

新機能・カメラ変更・デザイン変更・写真再アップロードは行っていない。

## 公式情報・安全性

2026-10-24に以下の公式資料と公開サービス情報を確認済み。

- [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/) / [アクセス仕様](https://nasa-gibs.github.io/gibs-api-docs/access-basics/)
- [WMTS capabilities](https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml): BlueMarble_ShadedRelief_Bathymetry、GoogleMapsCompatible_Level8。
- [地理院タイル一覧・出典](https://maps.gsi.go.jp/development/ichiran.html) / [利用規約](https://maps.gsi.go.jp/help/termsofuse.html)

新規APIキー・有料契約は不要。NASA GIBS / ESDISのリンクとacknowledgement、国土地理院・Landsat8・GEBCO等、既存標高の出典を地図／説明欄に保持。画像の撮影時期と解像度は統一されておらず、旅行当日の衛星写真ではない。

写真配信Worker、CORSの許可元、管理認証、アップロード制限は変更していない。プロキシ等で配信制限を回避していない。利用者のGPS・非公開EXIFは外部地図サービスへ送らない。今回の写真表示は既存の公開済み写真の読み込みのみ。

## 実ブラウザ検証

Mac上のCodex内蔵ブラウザ。GitHub Pages用の静的出力をlocalhostで配信。
PC約1280×720、スマートフォン相当のviewport 390×844（スクロールバーを除いた本文幅375px）で確認。

| 項目 | 確認結果 |
| --- | --- |
| PC ATLAS日本俯瞰 | NASAの陸海画像が表示。元画像にあった右上の灰色三角形は再現しない |
| ATLAS水戸への移動 | 広域から接近し国土地理院の市街地写真へ切り替え。地形と写真プレーンを表示 |
| 東京→水戸→長野 | 通常スクロールで0%→24%→42%（水戸）→82%→94%（長野）。各地の風景と地名が変化 |
| 逆スクロール | 長野94%→水戸42%→東京0%。水戸の実写真も再表示 |
| PCモード往復 | 長野94%でFLIGHT→ATLAS→FLIGHT。94%とセクション上端-5760pxを維持 |
| Memory Portal実写真 | 水戸の既存公開セルフィーを3DプレーンとしてPCの両モード、スマートフォン幅のFLIGHTで確認 |
| 長野写真 | 実写真未登録。長野専用の準備中プレーンと説明を表示。他旅行の写真は流用しない |
| スマートフォン幅 | 0%→水戸42%→長野到着→逆方向0%を確認。モード切り替え、ATLAS俯瞰、長野マーカー選択が動作 |
| スマートフォンのモード往復 | 水戸42%からATLASで長野を選択後、FLIGHTに戻ると元の42%へ復帰 |
| レイアウト | モード、地図操作、目的地ボタン、詳細リンクが操作可能。セクションの横はみ出しなし |
| Console | 確認終了時のerror / warnは0件 |

切り替え中の海岸・山岳・市街地を確認し、元の三角形の欠けや全画面の空白は再現しなかった。画像の色調・解像度は配信元の違いにより変化する。

検証用クリックがページを自動スクロールしないよう、モード往復は画面上の座標クリックを使用。スマートフォン幅の確認はタッチ実機テストではない。

ローカル証跡（Git管理対象外）:

- `outputs/atlas-overview-fixed.png`
- `outputs/atlas-mito-real-photo.png`
- `outputs/flight-mito-real-photo.png`
- `outputs/flight-nagano-arrival.png`
- `outputs/mobile-memory-portal.png`
- `outputs/mobile-atlas-overview.png`

## 自動確認

`npm test` が終了コード0で完了。飛行・地図スタイル10件と静的出力5件、計15件成功（失敗0件）。Next.js / TypeScript / Pages向け16ルートの静的ビルドも成功。
地図スタイルの追加テストは、GSI低ズーム画像の除外、WMTS座標順、出典、連続的なopacity、地形設定維持を検証する。外部画像そのものの将来の変更はテストで保証しない。

初回のビルドは実行環境が内部ポートの確保を禁止したため停止。同じコマンドを許可された実行環境で再実行して成功した。ビルド中の既存警告 `Couldn't load fs` / `Couldn't load zlib` は残るが、ビルド・後続テストは正常終了。`git diff --check` も成功。

## 未検証・対象外

- iPhone実機のSafari、タッチ／ピンチ操作、実機GPU・メモリ性能、低速回線・長時間使用。
- GitHub Pagesの公開環境。今回はpush・公開を行わない。
- 長野の実写真（未登録のため確認不可）。
- 全旅行のFLIGHTルート。既存の試作は東京・水戸大洗・長野のみ。
- 日本以外を含む全タイル・全ズームの網羅確認、外部サービスの将来の可用性。

# Journey Archive

## トップの「Journey Route」演出

トップページの水戸・大洗 → 長野の没入型ルートは、`app/data/home-passage.ts` で管理しています。スクロール操作がThree.jsの仮想カメラの前進・後退に連動し、旅行写真を空間内の「写真ポータル」として通過します。

- `image` にその旅の演出用写真を設定します。
- 配列に旅行を追加すると、次の写真ポータルとして拡張できます。
- 長野の仮の山景色は空間演出専用です。旅行カードの代表写真設定とは独立しています。

本人撮影の写真を使う場合は、たとえば `public/images/journeys/nagano-route.jpg` を追加し、`image: "/images/journeys/nagano-route.jpg"` に変更してください。旅行カード用の代表写真は従来どおり `app/data/site-images.ts` で別に管理されるため、この演出用の写真を変更してもカードの写真は変わりません。

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

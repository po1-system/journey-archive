# 旅行カードの代表写真

このフォルダに旅行ごとの横長写真を置きます。おすすめは **2200px以上・16:10または16:9・JPEGまたはWebP** です。

例: `nagano.jpg`

写真を置いたら、`app/data/site-images.ts` の `journeyImages` で該当する旅行の `src` を変更します。

```ts
nagano: { src: "/images/journeys/nagano.jpg", alt: "長野旅行の代表写真" },
```

この1か所の変更で、旅行一覧カード・トップのFeatured Journey・旅行詳細ページの表紙に同じ画像が使われます。

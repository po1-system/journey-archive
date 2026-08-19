# トップページのヒーロー画像

このフォルダに横長の写真を置きます。おすすめは **2400px以上・16:9・JPEGまたはWebP** です。

例: `hero-nagano.jpg`

写真を置いたら、`app/data/site-images.ts` の `homeHeroImages` に次を追加または変更します。

```ts
{ src: "/images/hero/hero-nagano.jpg", alt: "長野で撮影した写真", label: "夏の長野" },
```

保存してGitHubへ反映すると、トップで自動フェード切り替えされます。

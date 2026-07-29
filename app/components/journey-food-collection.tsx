"use client";

import { usePublishedPhotos } from "./journey-gallery";

export type FoodCollectionItem = {
  shop: string;
  dish: string;
  price?: string;
  image?: string;
  aliases?: string[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[・･\s　（）()「」『』]/g, "")
    .replace(/本店|支店|水戸店|生そば/g, "");
}

function belongsToShop(place: string, food: FoodCollectionItem) {
  const target = normalize(place);
  if (!target) return false;
  return [food.shop, ...(food.aliases ?? [])].some((name) => {
    const candidate = normalize(name);
    return target.includes(candidate) || candidate.includes(target);
  });
}

export default function JourneyFoodCollection({
  slug,
  foods,
  total,
}: {
  slug: string;
  foods: FoodCollectionItem[];
  total?: string;
}) {
  const published = usePublishedPhotos().filter(
    (photo) => photo.journey === slug && photo.placement === "food",
  );
  const basePath = process.env.NODE_ENV === "production" ? "/journey-archive" : "";

  return (
    <section className="food section">
      <div className="section-heading">
        <div>
          <p className="section-index">FOOD COLLECTION</p>
          <h2>旅で食べたもの</h2>
        </div>
        {total && <p>Food total · {total}</p>}
      </div>
      <div className="food-grid integrated-food-grid">
        {foods.map((food) => {
          const photos = published.filter((photo) => belongsToShop(photo.place, food));
          return (
            <article className="food-card integrated-food-card" key={food.shop}>
              <div className="food-photo-strip">
                {photos.length > 0 ? photos.map((photo) => (
                  <figure key={photo.id}>
                    {/* Published photos are already optimized WebP files. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.src.startsWith("http") ? photo.src : `${basePath}${photo.src}`} alt={photo.caption || `${food.shop} ${food.dish}`} loading="lazy" />
                    {photo.caption && <figcaption>{photo.caption}</figcaption>}
                  </figure>
                )) : (
                  <div className="food-image" style={food.image ? { backgroundImage: `url("${food.image}")` } : undefined} />
                )}
              </div>
              <div className="food-card-copy">
                <p>{food.shop}</p>
                <h3>{food.dish}</h3>
                <span>{food.price ?? "価格未確認"}</span>
                {photos.length > 0 && <small>{photos.length} photographs</small>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

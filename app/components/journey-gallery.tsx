import photoManifest from "../data/photo-manifest.json";

export type PhotoPlacement = "hero" | "day" | "food" | "place" | "best" | "gallery";

export type PublishedPhoto = {
  id: string;
  journey: string;
  day: number;
  place: string;
  takenAt?: string;
  src: string;
  caption?: string;
  placement?: PhotoPlacement;
};

export function getJourneyHero(slug: string) {
  return (photoManifest as PublishedPhoto[]).find((photo) => photo.journey === slug && photo.placement === "hero");
}

export default function JourneyGallery({ slug, placement = "gallery", title }: { slug: string; placement?: PhotoPlacement; title?: string }) {
  const photos = (photoManifest as PublishedPhoto[]).filter((photo) =>
    photo.journey === slug && (photo.placement ?? "gallery") === placement
  );
  const basePath = process.env.GITHUB_ACTIONS === "true" ? "/journey-archive" : "";
  if (photos.length === 0) return null;

  return (
    <section className="published-gallery section">
      <div className="section-heading">
        <div>
          <p className="section-index">{placement === "best" ? "BEST SHOT" : "PHOTO JOURNAL"}</p>
          <h2>{title ?? "旅の写真"}</h2>
        </div>
        <p>{photos.length} photographs</p>
      </div>
      <div className="published-photo-grid">
        {photos.map((photo) => (
          <figure key={photo.id}>
            {/* Published photos are already resized and optimized by the importer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${basePath}${photo.src}`} alt={photo.caption || photo.place} loading="lazy" />
            <figcaption>
              <span>DAY {photo.day}</span>
              <strong>{photo.place || "場所未設定"}</strong>
              {photo.takenAt && <time>{photo.takenAt}</time>}
              {photo.caption && <p>{photo.caption}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

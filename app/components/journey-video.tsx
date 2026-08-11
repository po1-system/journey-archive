"use client";

import { PHOTO_API, usePublishedPhotos } from "./journey-gallery";

export default function JourneyVideo({ slug }: { slug: string }) {
  const media = usePublishedPhotos()
    .filter((item) => item.mediaType === "video" && item.journey === slug && item.placement === "motion")
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  if (media.length === 0) return null;

  return (
    <section className="motion-journal section">
      <div className="section-heading">
        <div>
          <p className="section-index">MOTION JOURNAL</p>
          <h2>旅を、動きのままに。</h2>
        </div>
        <p>{media.length} films</p>
      </div>
      <div className="motion-grid">
        {media.map((video) => (
          <figure key={video.id}>
            <video controls playsInline preload="metadata" src={video.src.startsWith("http") ? video.src : `${PHOTO_API}/media/${encodeURIComponent(video.id)}`} />
            <figcaption>
              <span>DAY {video.day}</span>
              <strong>{video.place || "場所未設定"}</strong>
              {video.takenAt && <time>{video.takenAt}</time>}
              {video.caption && <p>{video.caption}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

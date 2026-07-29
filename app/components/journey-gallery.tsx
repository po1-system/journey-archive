"use client";

import { useEffect, useMemo, useState } from "react";
import photoManifest from "../data/photo-manifest.json";

export type PhotoPlacement = "hero" | "day" | "food" | "place" | "best" | "selfie" | "gallery";

export type PublishedPhoto = {
  id: string;
  journey: string;
  day: number;
  place: string;
  takenAt?: string;
  src: string;
  caption?: string;
  placement?: PhotoPlacement;
  rank?: number;
};

export const PHOTO_API = "https://journey-archive-photo-publisher.po1-system.workers.dev";

export function usePublishedPhotos() {
  const [remote, setRemote] = useState<PublishedPhoto[]>([]);

  useEffect(() => {
    fetch(`${PHOTO_API}/manifest`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((photos: PublishedPhoto[]) => setRemote(Array.isArray(photos) ? photos : []))
      .catch(() => setRemote([]));
  }, []);

  return useMemo(() => {
    const remoteIds = new Set(remote.map((photo) => photo.id));
    return [...(photoManifest as PublishedPhoto[]).filter((photo) => !remoteIds.has(photo.id)), ...remote];
  }, [remote]);
}

export default function JourneyGallery({ slug, placement = "gallery", title }: { slug: string; placement?: PhotoPlacement; title?: string }) {
  const publishedPhotos = usePublishedPhotos();
  const photos = publishedPhotos
    .filter((photo) => photo.journey === slug && (photo.placement ?? "gallery") === placement)
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .slice(0, placement === "selfie" ? 3 : placement === "best" ? 1 : undefined);
  const basePath = process.env.GITHUB_ACTIONS === "true" ? "/journey-archive" : "";
  if (photos.length === 0) return null;

  return (
    <section className="published-gallery section">
      <div className="section-heading">
        <div>
          <p className="section-index">{placement === "best" ? "BEST SCENERY" : placement === "selfie" ? "BEST SELFIES · TOP 3" : "PHOTO JOURNAL"}</p>
          <h2>{title ?? "旅の写真"}</h2>
        </div>
        <p>{photos.length} photographs</p>
      </div>
      <div className="published-photo-grid">
        {photos.map((photo) => (
          <figure key={photo.id}>
            {/* Published photos are already resized and optimized by the importer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src.startsWith("http") ? photo.src : `${basePath}${photo.src}`} alt={photo.caption || photo.place} loading="lazy" />
            <figcaption>
              <span>{placement === "selfie" ? `NO. ${photo.rank ?? "—"}` : `DAY ${photo.day}`}</span>
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

"use client";

import { usePublishedPhotos } from "./journey-gallery";

export default function JourneyHeroImage({ slug, fallback }: { slug: string; fallback?: string }) {
  const photo = usePublishedPhotos().find((item) => item.journey === slug && item.placement === "hero");
  const basePath = process.env.NODE_ENV === "production" ? "/journey-archive" : "";
  const source = photo?.src
    ? photo.src.startsWith("http") ? photo.src : `${basePath}${photo.src}`
    : fallback;

  return <div className="story-hero-image" style={source ? { backgroundImage: `url("${source}")` } : undefined} />;
}

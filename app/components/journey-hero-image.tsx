"use client";

import { usePublishedPhotos } from "./journey-gallery";

export default function JourneyHeroImage({ slug, fallback }: { slug: string; fallback?: string }) {
  const media = usePublishedPhotos();
  const photo = media.find((item) => item.journey === slug && item.placement === "hero" && item.mediaType !== "video");
  const video = media.find((item) => item.journey === slug && item.placement === "hero" && item.mediaType === "video");
  const basePath = process.env.NODE_ENV === "production" ? "/journey-archive" : "";
  const source = photo?.src
    ? photo.src.startsWith("http") ? photo.src : `${basePath}${photo.src}`
    : fallback;

  if (video) {
    const videoSource = video.src.startsWith("http") ? video.src : `https://journey-archive-photo-publisher.po1-system.workers.dev/media/${encodeURIComponent(video.id)}`;
    return <video className="story-hero-video" autoPlay muted loop playsInline preload="metadata" src={videoSource} />;
  }
  return <div className="story-hero-image" style={source ? { backgroundImage: `url("${source}")` } : undefined} />;
}

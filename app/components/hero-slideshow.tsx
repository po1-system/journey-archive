"use client";

import { useEffect, useRef, useState } from "react";
import type { ImageAsset } from "../data/site-images";
import { photoSource, photoSrcSet } from "./photo-source";

export default function HeroSlideshow({ images }: { images: ImageAsset[] }) {
  const host = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ current: 0, previous: -1 });
  const currentSlide = frame.current;
  useEffect(() => {
    if (images.length < 2 || !host.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false, cancelled = false;
    let nextImage: HTMLImageElement | undefined;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(host.current);
    const timer = window.setInterval(() => {
      if (!visible || document.hidden || reduced.matches || connection?.saveData || nextImage) return;
      const next = (currentSlide + 1) % images.length;
      const src = images[next].src;
      if (!src) return;
      nextImage = new Image();
      nextImage.onload = () => {
        if (!cancelled && visible && !document.hidden) setFrame({ current: next, previous: currentSlide });
        nextImage = undefined;
      };
      nextImage.onerror = () => { nextImage = undefined; };
      nextImage.sizes = "100vw";
      nextImage.srcset = photoSrcSet(src) ?? "";
      nextImage.src = photoSource(src, 1600);
    }, 7000);
    return () => {
      cancelled = true;
      clearInterval(timer);
      observer.disconnect();
      if (nextImage) { nextImage.onload = null; nextImage.onerror = null; }
    };
  }, [images, currentSlide]);

  return <div className="hero-slides" ref={host} aria-hidden="true">
    {images.map((image, index) => image.src && (index === frame.current || index === frame.previous) ? (
      // Original photo is retained; only already-public placeholder sizes vary.
      // eslint-disable-next-line @next/next/no-img-element
      <img key={image.src} className="hero-photo-layer" data-active={index === frame.current} data-initial={frame.previous === -1}
        src={photoSource(image.src, 1600)} srcSet={photoSrcSet(image.src)} sizes="100vw" alt=""
        fetchPriority={index === 0 ? "high" : "low"} decoding="async" />
    ) : null)}
  </div>;
}

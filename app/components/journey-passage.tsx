"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { PassageScene } from "../data/home-passage";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export default function JourneyPassage({ scenes }: { scenes: PassageScene[] }) {
  const sceneRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (motion.matches) return;

      const viewport = window.innerHeight || 1;
      sceneRefs.current.forEach((scene) => {
        if (!scene) return;
        const rect = scene.getBoundingClientRect();
        const travel = Math.max(rect.height - viewport, 1);
        const progress = clamp((-rect.top) / travel);
        scene.style.setProperty("--scene-progress", progress.toFixed(4));
      });
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    motion.addEventListener("change", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      motion.removeEventListener("change", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="journey-passage" id="passage" aria-label="景色の中を巡る旅の記録">
      <div className="passage-intro">
        <p className="section-index">002 — TRAVEL THROUGH MEMORY</p>
        <p>Scroll to move forward</p>
      </div>
      {scenes.map((scene, index) => {
        const midground = scene.layers.midground ?? scene.layers.background;
        const foreground = scene.layers.foreground ?? scene.layers.background;
        return (
          <article
            className="passage-scene"
            data-scene={scene.slug}
            key={scene.slug}
            ref={(node) => { sceneRefs.current[index] = node; }}
          >
            <div className="passage-sticky">
              <div className="passage-layer passage-background" style={{ backgroundImage: `url("${scene.layers.background}")` }} />
              <div className="passage-layer passage-midground" style={{ backgroundImage: `url("${midground}")` }} />
              <div className="passage-layer passage-foreground" style={{ backgroundImage: `url("${foreground}")` }} />
              <div className="passage-vignette" />

              <div className="passage-copy">
                <p className="passage-number">{scene.number} / {String(scenes.length + 7).padStart(2, "0")}</p>
                <p className="passage-prefecture">{scene.prefecture}</p>
                <h2>{scene.title}</h2>
                <p className="passage-date">{scene.date} · {scene.duration}</p>
                <p className="passage-line">{scene.line}</p>
                <Link href={scene.href} className="passage-link">Open the archive <span>→</span></Link>
              </div>

              <div className="passage-coordinate" aria-hidden="true">
                <span>SCENE {String(index + 1).padStart(2, "0")}</span>
                <i />
                <span>FORWARD / {Math.round((index + 1) / scenes.length * 100)}%</span>
              </div>

              {scene.next && (
                <div className="passage-next" aria-hidden="true">
                  <div className="passage-next-image" style={{ backgroundImage: `url("${scene.next.image}")` }} />
                  <div className="passage-next-shade" />
                  <div className="passage-next-copy">
                    <p>{scene.next.isPlaceholder ? "NEXT LANDSCAPE · PREVIEW" : "NEXT LANDSCAPE"}</p>
                    <strong>{scene.next.prefecture}｜{scene.next.title}</strong>
                    <span>{scene.next.date}</span>
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

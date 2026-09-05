"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { JourneyRouteStop } from "../data/home-passage";
import { distanceKm, type flightState } from "./flight-math";
import { usePublishedPhotos } from "./journey-gallery";
import "./japan-flight.css";

type Flight = Awaited<ReturnType<typeof import("./japan-flight-scene").createJapanFlight>>;
type Status = ReturnType<typeof flightState>;

export default function JourneyPassage({ scenes }: { scenes: JourneyRouteStop[] }) {
  const hostRef = useRef<HTMLElement>(null), canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Flight | null>(null), countRef = useRef<HTMLOutputElement>(null);
  const [mode, setMode] = useState("loading");
  const [status, setStatus] = useState<Status>({ leg: 0, local: 0, phase: "DEPARTURE" });
  const published = usePublishedPhotos();
  const resolved = useMemo(() => scenes.map((stop) => {
    const candidates = published.filter((p) => p.journey === stop.slug && p.mediaType !== "video");
    const photo = candidates.find((p) => p.placement === "hero") ?? candidates.filter((p) => p.placement === "best").sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))[0];
    return photo ? { ...stop, image: photo.src, imageIsPlaceholder: false } : stop;
  }), [scenes, published]);
  const sourceRef = useRef(resolved);
  useEffect(() => { sourceRef.current = resolved; engineRef.current?.refresh(); }, [resolved]);

  useEffect(() => {
    const host = hostRef.current, canvasHost = canvasRef.current;
    if (!host || !canvasHost) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, generation = 0;
    const start = async () => {
      const id = ++generation; engineRef.current?.dispose(); engineRef.current = null;
      if (motion.matches) { setMode("fallback"); return; }
      setMode("loading");
      try {
        const { createJapanFlight } = await import("./japan-flight-scene");
        if (disposed || id !== generation) return;
        let lastKey = "";
        const engine = await createJapanFlight({
          host, canvasHost, stops: scenes,
          basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
          getStops: () => sourceRef.current,
          onReady: () => { if (!disposed && id === generation) setMode("ready"); },
          onError: () => { if (!disposed && id === generation) { setMode("fallback"); engineRef.current?.dispose(); engineRef.current = null; } },
          onFrame: (progress, next) => {
            host.style.setProperty("--flight-progress", String(progress));
            host.style.setProperty("--flight-intro", String(Math.max(0, 1 - progress * 80)));
            if (countRef.current) countRef.current.value = `${Math.round(progress * 100).toString().padStart(2, "0")}%`;
            const key = `${next.leg}:${next.phase}`;
            if (key !== lastKey) { lastKey = key; setStatus(next); }
          },
        });
        if (disposed || id !== generation) engine.dispose(); else engineRef.current = engine;
      } catch { if (!disposed && id === generation) setMode("fallback"); }
    };
    // Start only when the main experience is near the viewport.
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { observer.disconnect(); void start(); } }, { rootMargin: "200px" });
    observer.observe(host); motion.addEventListener("change", start);
    return () => { disposed = true; generation++; observer.disconnect(); motion.removeEventListener("change", start); engineRef.current?.dispose(); engineRef.current = null; };
  }, [scenes]);

  function goTo(index: number) {
    const host = hostRef.current;
    if (!host || mode === "fallback") return;
    const progress = index === 0 ? 0 : (index - 1 + .86) / (scenes.length - 1);
    const height = host.querySelector<HTMLElement>(".aerial-stage")?.clientHeight ?? innerHeight;
    window.scrollTo({ top: scrollY + host.getBoundingClientRect().top + progress * (host.offsetHeight - height), behavior: "instant" });
  }
  const from = resolved[status.leg], to = resolved[status.leg + 1];
  const arrival = status.phase === "ARRIVAL" || status.phase === "PASSAGE";
  return (
    <section className="aerial-journey" data-mode={mode} id="passage" ref={hostRef} aria-label="東京から長野へ、日本地図を飛ぶ旅" style={{ height: mode === "fallback" ? "auto" : `${(scenes.length - 1) * 235 + 100}svh` }}>
      <div className="aerial-stage">
        <div className="aerial-canvas" ref={canvasRef} aria-hidden="true" />
        <div className="aerial-vignette" aria-hidden="true" />
        <div className="aerial-intro">
          <p>A JOURNEY ACROSS JAPAN</p>
          <h1>旅した日本を、<br />空から。</h1>
          <span>東京から、9つの旅の記憶へ。<br />スクロールして、飛び立つ。</span>
        </div>
        <a className="aerial-skip" href="#explore">旅行一覧へスキップ <span>↘</span></a>
        <div className="aerial-caption" aria-live="polite">
          <p>{arrival ? `${to.number} — ${status.phase === "PASSAGE" ? "ONWARD" : "ARRIVAL"}` : `${status.phase} / ${from.english} → ${to.english}`}</p>
          <h2>{arrival ? to.title : to.prefecture}</h2>
          <span>{arrival ? to.date : `${from.anchor} → ${to.anchor}　直線距離 約${Math.round(distanceKm(from, to)).toLocaleString()} km`}</span>
          {arrival && <Link href={to.href} className="aerial-story">旅の記録を開く <span>↗</span></Link>}
          {arrival && <small>{!to.image ? "代表写真は準備中" : to.imageIsPlaceholder ? "イメージ写真 · 自分の写真に差し替え可能" : "旅の代表写真"}</small>}
        </div>
        <div className="aerial-bottom">
          <div className="aerial-progress"><span>TOKYO — NAGANO</span><i /><output ref={countRef}>00%</output></div>
          <nav className="aerial-stops" aria-label="飛行する旅先を選択">
            {scenes.map((stop, i) => <button key={stop.slug} onClick={() => goTo(i)} aria-label={`${stop.title}へ移動`} aria-current={(arrival ? status.leg + 1 : status.leg) === i ? "step" : undefined}><b>{stop.number}</b><span>{i === 0 ? "東京" : stop.prefecture.replace(/[県都]$/, "")}</span></button>)}
          </nav>
          <p className="aerial-credit">訪問順を結ぶ演出ルート・実際の交通経路ではありません <span>Map: Natural Earth</span></p>
        </div>
        {mode === "loading" && <div className="aerial-loading" role="status">日本の空へ、まもなく。</div>}
        <div className="aerial-fallback">
          <p className="section-index">JOURNEYS ACROSS JAPAN</p><h2>日本を巡った旅の記録。</h2>
          <p>東京から長野まで、訪問順に旅をたどる。</p>
          <div>{resolved.slice(1).map((stop) => <Link href={stop.href} key={stop.slug}><small>{stop.number} / {stop.prefecture}</small><strong>{stop.title}</strong><span>{stop.date} ↗</span></Link>)}</div>
        </div>
      </div>
    </section>
  );
}

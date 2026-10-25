"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { JourneyRouteStop } from "../../data/home-passage";
import { usePublishedPhotos } from "../journey-gallery";
import { prototypeSlugs, arrivalProgress, type FlightMode } from "./flight-model";
import "maplibre-gl/dist/maplibre-gl.css";
import "./immersive.css";

type Engine = ReturnType<typeof import("./map-engine").createImmersiveMap>;

export default function ImmersiveJourney({ scenes }: { scenes: JourneyRouteStop[] }) {
  const section = useRef<HTMLElement>(null), canvas = useRef<HTMLDivElement>(null), output = useRef<HTMLOutputElement>(null);
  const engine = useRef<Engine | null>(null);
  const [mode, setMode] = useState<FlightMode>("flight");
  const [status, setStatus] = useState("loading"), [warning, setWarning] = useState("");
  const [selected, setSelected] = useState("mito-oarai");
  const route = useMemo(() => prototypeSlugs.map(slug => scenes.find(s => s.slug === slug)!), [scenes]);
  const [phase, setPhase] = useState({ leg: 0, phase: "DEPARTURE" });
  const published = usePublishedPhotos();
  const resolved = useMemo(() => scenes.map(stop => {
    const priorities = ["hero", "best", "place", "day", "gallery", "selfie"];
    const photos = published.filter(p => p.journey === stop.slug && p.mediaType !== "video" && priorities.includes(p.placement ?? "gallery"));
    const photo = photos.sort((a, b) => priorities.indexOf(a.placement ?? "gallery") - priorities.indexOf(b.placement ?? "gallery") || (a.rank ?? 99) - (b.rank ?? 99))[0];
    return photo ? { ...stop, image: photo.src } : stop;
  }), [scenes, published]);
  const photoRef = useRef(resolved);
  useEffect(() => { photoRef.current = resolved; engine.current?.refresh(); }, [resolved]);
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const host = section.current, container = canvas.current;
    if (!host || !container) return;
    let disposed = false, generation = 0;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    async function start() {
      const ticket = ++generation;
      engine.current?.dispose(); engine.current = null;
      if (motion.matches) { setStatus("reduced"); return; }
      setStatus("loading");
      try {
        const { createImmersiveMap } = await import("./map-engine");
        if (disposed || generation !== ticket) return;
        let last = "";
        engine.current = createImmersiveMap({
          section: host!, container: container!, stops: route, atlasStops: scenes,
          basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
          getPhoto: slug => photoRef.current.find(s => s.slug === slug),
          onReady: () => { if (!disposed && generation === ticket) { setStatus("ready"); engine.current?.setMode(modeRef.current); } },
          onWarning: message => { if (!disposed && generation === ticket) setWarning(message); },
          onError: () => { if (!disposed && generation === ticket) { setStatus("unavailable"); engine.current?.dispose(); engine.current = null; } },
          onFrame: state => {
            if (disposed || generation !== ticket) return;
            if (output.current) output.current.value = `${Math.round(state.progress * 100).toString().padStart(2, "0")}%`;
            const key = `${state.leg}:${state.phase}`;
            if (key !== last) { last = key; setPhase({ leg: state.leg, phase: state.phase }); }
          },
          onSelect: slug => {
            if (disposed || generation !== ticket) return;
            if (modeRef.current === "flight") goTo(slug); else setSelected(slug);
          },
        });
      } catch { if (!disposed && generation === ticket) setStatus("unavailable"); }
    }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { observer.disconnect(); void start(); } }, { rootMargin: "100px" });
    observer.observe(host); motion.addEventListener("change", start);
    return () => { disposed = true; generation++; observer.disconnect(); motion.removeEventListener("change", start); engine.current?.dispose(); engine.current = null; };
  }, [route, scenes]);

  function goTo(slug: string) {
    const host = section.current; if (!host) return;
    if (modeRef.current === "atlas") { engine.current?.select(slug); return; }
    const index = route.findIndex(stop => stop.slug === slug); if (index < 0) return;
    const height = canvas.current?.clientHeight ?? innerHeight;
    window.scrollTo({ top: scrollY + host.getBoundingClientRect().top + arrivalProgress(index, route.length) * (host.offsetHeight - height), behavior: "instant" });
  }
  function switchMode(next: FlightMode) {
    modeRef.current = next; setMode(next); engine.current?.setMode(next);
  }
  const current = resolved.find(s => s.slug === (mode === "atlas" ? selected : route[phase.leg + 1].slug))!;
  const arrival = phase.phase === "MEMORY PORTAL" || phase.phase === "ONWARD";
  const fallback = status === "reduced" || status === "unavailable";

  return <section id="passage" ref={section} className="immersive-journey" data-mode={mode} data-status={status} aria-label="Immersive Flight Experience">
    <div className="immersive-stage">
      <div ref={canvas} className="immersive-map" />
      <div className="immersive-grade" aria-hidden="true" />
      <div className="immersive-clouds" aria-hidden="true" />
      <div className="immersive-toolbar">
        <div className="immersive-modes" role="group" aria-label="体験モード">
          <button aria-pressed={mode === "flight"} disabled={status !== "ready"} onClick={() => switchMode("flight")}><span>01</span> FLIGHT MODE</button>
          <button aria-pressed={mode === "atlas"} disabled={status !== "ready"} onClick={() => switchMode("atlas")}><span>02</span> ATLAS MODE</button>
        </div>
        <a href="#explore" className="immersive-skip">旅行一覧へ ↗</a>
      </div>
      <div className="immersive-opening">
        <p>A JOURNEY ABOVE, A MEMORY WITHIN.</p>
        <h1>空を旅して、<br />記憶にふれる。</h1>
        <span>海へ。山へ。その日の光へ。<br />スクロールして、旅の続きを。</span>
      </div>
      <div className="immersive-location" aria-live="polite">
        <p>{mode === "atlas" ? "SELECTED MEMORY" : phase.phase} <i /> {current.prefecture}</p>
        <h2>{current.title}</h2><span>{current.date}</span>
        {(mode === "atlas" || arrival) && current.slug !== "tokyo" && <Link href={current.href}>旅の記録を開く <b>↗</b></Link>}
        {(mode === "atlas" || arrival) && !current.image && <small>旅の写真は準備中 · 他の旅の写真は流用しません</small>}
      </div>
      {mode === "atlas" && <div className="atlas-controls" aria-label="地図操作">
        <button onClick={() => engine.current?.overview()} aria-label="日本全体を俯瞰">日本全体 ↗</button>
        <button onClick={() => engine.current?.zoom(1)} aria-label="地図を拡大">＋</button>
        <button onClick={() => engine.current?.zoom(-1)} aria-label="地図を縮小">−</button>
        <button onClick={() => engine.current?.orient()} aria-label="北向きに戻す">N ↑</button>
      </div>}
      <div className="immersive-footer">
        <div className="immersive-instruction"><span>{mode === "flight" ? "SCROLL TO FLY · 逆スクロールで戻る" : "ドラッグで移動 · ピンチで拡大 · 右ドラッグ / 2本指で傾ける"}</span><output ref={output} hidden={mode === "atlas"}>00%</output></div>
        <nav className="immersive-destinations" aria-label="目的地を選ぶ">
          {(mode === "flight" ? route : scenes).map(stop => <button key={stop.slug} onClick={() => goTo(stop.slug)} aria-label={`${stop.title}へ移動`} aria-current={current.slug === stop.slug ? "step" : undefined}><small>{stop.number}</small>{stop.slug === "tokyo" ? "東京" : stop.title}</button>)}
        </nav>
        <div className="immersive-footnote"><span>{mode === "flight" ? "PROTOTYPE / TOKYO → MITO・OARAI → NAGANO" : "ATLAS / YOUR JOURNEYS ACROSS JAPAN"}<br />訪問地を結ぶ演出ルート · 実際の交通経路ではありません</span>
          <details><summary>地図・演出について</summary><div>
            <p>広域はNASA Blue Marble、接近時は国土地理院の空撮・衛星画像へ滑らかに切り替わります。Mapzenの標高データを1.25倍の起伏で描画しています。建物の3Dモデルではありません。</p>
            <p>雲・霧・光は映像演出です。夏の旅行に合わせた色調で、当日の天候や現在の季節を示すものではありません。</p>
            <p>APIキー・新規有料契約は不要。公開配信に依存するため、速度・継続提供は保証されません。</p>
            <p>We acknowledge the use of imagery provided by services from NASA&apos;s Global Imagery Browse Services (GIBS), part of NASA&apos;s Earth Science Data and Information System (ESDIS).</p>
            <a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noreferrer">NASA GIBSの出典・利用条件 ↗</a>
            <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">国土地理院の出典・利用条件 ↗</a>
            <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noreferrer">標高データの出典・利用条件 ↗</a>
          </div></details>
        </div>
      </div>
      {status === "loading" && <div className="immersive-status" role="status">空の旅を準備しています…</div>}
      {warning && !fallback && <div className="immersive-warning" role="status">{warning}</div>}
      {fallback && <div className="immersive-fallback"><p>JOURNEY ARCHIVE</p><h2>旅の記憶を、訪問順に。</h2><span>{status === "reduced" ? "動きを減らす設定に合わせて、一覧で表示しています。" : "3D地図を読み込めませんでした。旅行記録はこちらから閲覧できます。"}</span><div>{scenes.slice(1).map(stop => <Link key={stop.slug} href={stop.href}><small>{stop.number} / {stop.date}</small><strong>{stop.title} ↗</strong></Link>)}</div></div>}
      <noscript><div className="immersive-nojs">3D体験にはJavaScriptが必要です。<a href="#explore">旅行一覧へ進む</a></div></noscript>
    </div>
  </section>;
}

import { Map, Marker, AttributionControl, setWorkerUrl, type GeoJSONSource } from "maplibre-gl";
import type { JourneyRouteStop } from "../../data/home-passage";
import { mapStyle } from "./map-style";
import { createMemoryPortal } from "./memory-portal";
import { sampleFlight, dampProgress, clamp01, type FlightMode } from "./flight-model";

type Options = {
  container: HTMLElement; section: HTMLElement; stops: JourneyRouteStop[]; atlasStops: JourneyRouteStop[]; basePath: string;
  getPhoto: (slug: string) => JourneyRouteStop | undefined;
  onReady: () => void; onError: () => void; onWarning: (warning: string) => void;
  onFrame: (state: ReturnType<typeof sampleFlight>) => void;
  onSelect: (slug: string) => void;
};

export function createImmersiveMap(options: Options) {
  // MapLibre's import.meta worker discovery is rewritten incorrectly by Turbopack.
  // Serve the official standalone worker from our own origin (also on Pages).
  setWorkerUrl(new URL(`${options.basePath}/vendor/maplibre-gl-worker.js?v=6.15.0`, window.location.origin).href);
  const { container, section, stops, atlasStops } = options;
  const compact = matchMedia("(max-width:700px)").matches;
  let mode: FlightMode = "flight", current = 0, target = 0, lastTime = 0, frame = 0;
  let ready = false, dead = false, visible = true, resuming = false, selected = stops[1].slug;
  let firstAerialTile = false, firstTerrainTile = false;
  const initial = sampleFlight(0, stops);
  const map = new Map({
    container, style: mapStyle(), ...initial.pose, maxPitch: 75, minZoom: 3.5, maxZoom: compact ? 15.5 : 16.5,
    maxBounds: [[122, 20], [150, 48]], renderWorldCopies: false,
    pixelRatio: Math.min(devicePixelRatio, compact ? 1.25 : 1.75),
    canvasContextAttributes: { antialias: !compact, powerPreference: "low-power" },
    maxTileCacheSize: compact ? 60 : 120, maxTileCacheZoomLevels: 3, fadeDuration: 300,
    attributionControl: false, dragPan: false, dragRotate: false, scrollZoom: false, touchZoomRotate: false, touchPitch: false, keyboard: false, doubleClickZoom: false,
  });
  map.addControl(new AttributionControl({ compact: true }), "bottom-right");
  map.getCanvas().setAttribute("aria-label", "日本の3D地形地図。ATLASモードで自由に操作できます。");
  const portal = createMemoryPortal(options.basePath, compact);
  const markers: Marker[] = [];
  const markerButtons: HTMLButtonElement[] = [];

  function interact(enabled: boolean) {
    [map.dragPan, map.dragRotate, map.scrollZoom, map.touchZoomRotate, map.touchPitch, map.keyboard, map.doubleClickZoom].forEach(handler => enabled ? handler.enable() : handler.disable());
    container.dataset.interactive = String(enabled);
  }
  function updateRoute(progress: number) {
    const steps = 80;
    const coordinates = Array.from({ length: Math.max(2, Math.ceil(progress * steps)) }, (_, i) => sampleFlight(Math.min(progress, i / steps), stops).pose.center);
    (map.getSource("travelled") as GeoJSONSource | undefined)?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } });
  }
  function paint() {
    if (!ready || dead) return;
    const state = sampleFlight(current, stops);
    const slug = mode === "flight" ? stops[state.leg + 1].slug : selected;
    portal.show(options.getPhoto(slug), mode === "flight" ? state.portal : map.getZoom() > 11.5 ? 1 : 0);
    markerButtons.forEach((button, i) => {
      button.dataset.selected = String(atlasStops[i].slug === slug);
      button.hidden = mode === "flight" && !stops.some(stop => stop.slug === atlasStops[i].slug);
    });
    section.style.setProperty("--flight-progress", String(current));
    section.style.setProperty("--flight-reveal", String(Math.min(1, current * 16)));
    section.style.setProperty("--flight-cloud", String(.10 + Math.sin(state.local * Math.PI) * .14));
    section.dataset.season = state.leg === 0 ? "summer-coast" : "late-summer";
    options.onFrame(state);
  }
  function tick(time: number) {
    frame = 0;
    if (dead || !visible || document.hidden || !ready || mode !== "flight" || resuming) return;
    current = dampProgress(current, target, (time - lastTime) / 1000 || .016); lastTime = time;
    const state = sampleFlight(current, stops);
    map.jumpTo(state.pose); updateRoute(current); paint();
    if (current !== target) schedule();
  }
  function schedule() { if (!frame && !dead && visible && !document.hidden) frame = requestAnimationFrame(tick); }
  function readScroll() {
    if (mode !== "flight") return;
    target = clamp01(-section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - container.clientHeight));
    schedule();
  }
  const timeout = window.setTimeout(() => { if (!ready && !dead) options.onError(); }, 22000);
  map.on("load", () => {
    if (dead) return;
    const route = Array.from({ length: 81 }, (_, i) => sampleFlight(i / 80, stops).pose.center);
    map.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route } } });
    map.addSource("travelled", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route.slice(0, 2) } } });
    map.addLayer({ id: "route-shadow", type: "line", source: "route", paint: { "line-width": 5, "line-color": "#102329", "line-opacity": .45 } });
    map.addLayer({ id: "route-line", type: "line", source: "route", paint: { "line-width": 1.5, "line-color": "#e8d4a8", "line-opacity": .6, "line-dasharray": [2, 4] } });
    map.addLayer({ id: "travelled-line", type: "line", source: "travelled", paint: { "line-width": 2, "line-color": "#ffdf9e" } });
    map.addLayer(portal.layer);
    atlasStops.forEach(stop => {
      const button = document.createElement("button"); button.className = "flight-marker";
      button.type = "button"; button.setAttribute("aria-label", `${stop.title}へ飛行`);
      const dot = document.createElement("i"), label = document.createElement("span");
      label.textContent = stop.anchor; button.append(dot, label);
      button.addEventListener("click", () => {
        if (mode === "atlas") api.select(stop.slug);
        else options.onSelect(stop.slug);
      });
      markerButtons.push(button); markers.push(new Marker({ element: button, anchor: "bottom" }).setLngLat([stop.longitude, stop.latitude]).addTo(map));
    });
    ready = true; clearTimeout(timeout); options.onReady(); readScroll(); paint();
  });
  let errors = 0;
  map.on("sourcedata", event => {
    if ((event.sourceId === "aerial" || event.sourceId === "overview") && event.sourceDataType === "content") firstAerialTile = true;
    if (event.sourceId === "elevation" && event.sourceDataType === "content") firstTerrainTile = true;
    if (firstAerialTile && firstTerrainTile) options.onWarning("");
  });
  map.on("error", () => {
    if (dead) return;
    errors++;
    if (errors > 3) options.onWarning(firstAerialTile ? "一部の地形・写真タイルを取得できません。通信環境をご確認ください。" : "地図データを取得できません。下の旅行一覧もご利用いただけます。");
  });
  map.on("move", () => { if (mode === "atlas") { paint(); } });
  map.on("webglcontextlost", () => { if (!dead) options.onError(); });
  const resize = new ResizeObserver(() => { map.resize(); readScroll(); }); resize.observe(container);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) { map.stop(); if (frame) cancelAnimationFrame(frame); frame = 0; }
    else { lastTime = performance.now(); readScroll(); }
  }); observer.observe(section);
  function visibility() { if (document.hidden) map.stop(); else { lastTime = performance.now(); schedule(); } }
  interact(false);
  window.addEventListener("scroll", readScroll, { passive: true }); document.addEventListener("visibilitychange", visibility);
  const api = {
    setMode(next: FlightMode) {
      if (!ready || next === mode) return;
      map.stop(); mode = next; interact(next === "atlas");
      if (next === "atlas") {
        selected = stops[sampleFlight(current, stops).leg + 1].slug;
        options.onSelect(selected); resuming = false;
      } else {
        resuming = true;
        map.easeTo({ ...sampleFlight(current, stops).pose, duration: 1400, essential: false });
        map.once("moveend", () => { resuming = false; readScroll(); });
      }
      paint(); map.triggerRepaint();
    },
    select(slug: string) {
      const stop = atlasStops.find(s => s.slug === slug); if (!stop || !ready) return;
      selected = slug; options.onSelect(slug);
      map.flyTo({ center: [stop.longitude, stop.latitude], zoom: 13.6, pitch: 64, bearing: -20, duration: 3600, essential: false }); paint();
    },
    overview() { if (ready) map.fitBounds([[127, 26], [145.5, 45.5]], { padding: { top: 130, bottom: 190, left: 35, right: 35 }, pitch: 35, bearing: -12, duration: 2200 }); },
    zoom(direction: number) { if (ready) map.easeTo({ zoom: map.getZoom() + direction, duration: 500 }); },
    orient() { if (ready) map.easeTo({ bearing: 0, pitch: 55, duration: 900 }); },
    refresh() { paint(); map.triggerRepaint(); },
    dispose() {
      dead = true; clearTimeout(timeout); if (frame) cancelAnimationFrame(frame);
      observer.disconnect(); resize.disconnect(); window.removeEventListener("scroll", readScroll); document.removeEventListener("visibilitychange", visibility);
      markers.forEach(marker => marker.remove()); map.remove();
    },
  };
  return api;
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import japanMap from "@svg-maps/japan";
import type { Journey } from "../data/journeys";
import { mitoJourney } from "../archive-config";
import { getJourneyImage } from "../data/site-images";

type ArchiveJourney = Pick<Journey, "slug" | "number" | "prefecture" | "title" | "area" | "date" | "duration" | "year" | "totalCost" | "image" | "bestPhoto" | "bestFood" | "bestPlace" | "status">;

const prefectureNames: Record<string, string> = {
  aichi: "愛知県", akita: "秋田県", aomori: "青森県", chiba: "千葉県",
  ehime: "愛媛県", fukui: "福井県", fukuoka: "福岡県", fukushima: "福島県",
  gifu: "岐阜県", gunma: "群馬県", hiroshima: "広島県", hokkaido: "北海道",
  hyogo: "兵庫県", ibaraki: "茨城県", ishikawa: "石川県", iwate: "岩手県",
  kagawa: "香川県", kagoshima: "鹿児島県", kanagawa: "神奈川県", kochi: "高知県",
  kumamoto: "熊本県", kyoto: "京都府", mie: "三重県", miyagi: "宮城県",
  miyazaki: "宮崎県", nagano: "長野県", nagasaki: "長崎県", nara: "奈良県",
  niigata: "新潟県", oita: "大分県", okayama: "岡山県", okinawa: "沖縄県",
  osaka: "大阪府", saga: "佐賀県", saitama: "埼玉県", shiga: "滋賀県",
  shimane: "島根県", shizuoka: "静岡県", tochigi: "栃木県", tokushima: "徳島県",
  tokyo: "東京都", tottori: "鳥取県", toyama: "富山県", wakayama: "和歌山県",
  yamagata: "山形県", yamaguchi: "山口県", yamanashi: "山梨県",
};

const journeyPoints: Record<string, { x: number; y: number }> = {
  kagawa: { x: 30, y: 69 },
  fukuoka: { x: 16, y: 77 },
  hiroshima: { x: 24, y: 65 },
  okinawa: { x: 9, y: 92 },
  wakayama: { x: 39, y: 72 },
  ishikawa: { x: 45, y: 48 },
  hakodate: { x: 81, y: 15 },
  "mito-oarai": { x: 70, y: 61 },
  nagano: { x: 56, y: 58 },
};

export default function ArchiveDashboard({ journeys }: { journeys: ArchiveJourney[] }) {
  const allJourneys = useMemo(
    () => [...journeys, mitoJourney as ArchiveJourney].sort((a, b) => Number(a.number) - Number(b.number)),
    [journeys],
  );
  const completedJourneys = allJourneys.filter((journey) => journey.status !== "planned");
  const plannedJourneys = allJourneys.filter((journey) => journey.status === "planned");
  const [year, setYear] = useState("すべて");
  const [prefecture, setPrefecture] = useState("すべて");
  const [activeJourneySlug, setActiveJourneySlug] = useState("mito-oarai");
  const [constellationMode, setConstellationMode] = useState<"geography" | "chronology">("geography");
  const years = [...new Set(allJourneys.map((journey) => journey.year))].sort();
  const prefectures = [...new Set(allJourneys.map((journey) => journey.prefecture))];
  const filtered = allJourneys.filter((journey) =>
    (year === "すべて" || journey.year === Number(year)) &&
    (prefecture === "すべて" || journey.prefecture === prefecture)
  );
  const visited = new Set(completedJourneys.map((journey) => journey.prefecture));
  const total = completedJourneys.reduce((sum, journey) => sum + journey.totalCost, 0);
  const rankedPhotos = completedJourneys.filter((journey) => journey.bestPhoto);
  const rankedFoods = completedJourneys.filter((journey) => journey.bestFood);
  const activeJourney = completedJourneys.find((journey) => journey.slug === activeJourneySlug) ?? completedJourneys[0];
  const activeJourneyIndex = completedJourneys.findIndex((journey) => journey.slug === activeJourney.slug);
  const displayPoints = completedJourneys.map((journey, index) =>
    constellationMode === "geography"
      ? journeyPoints[journey.slug]
      : { x: 10 + index * (80 / Math.max(1, completedJourneys.length - 1)), y: 50 + Math.sin(index * 1.75) * 22 },
  );
  const constellationPoints = displayPoints
    .filter(Boolean)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const travelledPoints = displayPoints
    .slice(0, activeJourneyIndex + 1)
    .filter(Boolean)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <>
      <section className="archive-tools section" id="explore">
        <div className="section-heading">
          <div>
            <p className="section-index">003 — JOURNEY INDEX</p>
            <h2>旅の記録</h2>
          </div>
          <p>{filtered.length} journeys · {plannedJourneys.length} upcoming</p>
        </div>
        <div className="filter-bar">
          <label>年
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              <option>すべて</option>
              {years.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>都道府県
            <select value={prefecture} onChange={(event) => setPrefecture(event.target.value)}>
              <option>すべて</option>
              {prefectures.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="journey-card-grid">
          {filtered.map((journey) => (
            <Link href={`/journeys/${journey.slug}`} className="journey-card" key={journey.slug}>
              <div
                className={`journey-card-image${getJourneyImage(journey.slug).src ? "" : " is-placeholder"}`}
                style={getJourneyImage(journey.slug).src ? { backgroundImage: `url("${getJourneyImage(journey.slug).src}")` } : undefined}
              />
              <div>
                <span>{journey.status === "planned" ? "UPCOMING · " : ""}{journey.number} · {journey.date}</span>
                <h3>{journey.prefecture}</h3>
                <p>{journey.title} · {journey.duration}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="map-section section" id="map">
        <div className="section-heading">
          <div>
            <p className="section-index">004 — MEMORY CONSTELLATION</p>
            <h2>旅した日本</h2>
          </div>
          <p>{completedJourneys.length} journeys · {visited.size} / 47 prefectures</p>
        </div>
        <div className="constellation-controls" aria-label="地図の表示方法">
          <button className={constellationMode === "geography" ? "active" : ""} onClick={() => setConstellationMode("geography")}>
            <span>01</span> Geography
          </button>
          <button className={constellationMode === "chronology" ? "active" : ""} onClick={() => setConstellationMode("chronology")}>
            <span>02</span> Chronology
          </button>
          <p>{constellationMode === "geography" ? "場所から記憶をたどる" : "時間から記憶をたどる"}</p>
        </div>
        <div className="constellation-shell">
          <div className={`map-frame constellation-map mode-${constellationMode}`}>
            <div className="memory-ambient-image" style={getJourneyImage(activeJourney.slug).src ? { backgroundImage: `url("${getJourneyImage(activeJourney.slug).src}")` } : undefined} />
            <span className="map-coordinate">24° — 46° N</span>
            <svg className="japan-map" viewBox={japanMap.viewBox} role="img" aria-label={`訪問済み${visited.size}都道府県を色付けした日本地図`}>
              <defs>
                <filter id="gold-glow" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id="visited-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e2c98e" />
                  <stop offset="100%" stopColor="#8d7344" />
                </linearGradient>
              </defs>
              {japanMap.locations.map((location: { id: string; name: string; path: string }) => {
                const name = prefectureNames[location.id] ?? location.name;
                const isVisited = visited.has(name);
                return (
                  <g
                    key={location.id}
                    className={isVisited ? "map-prefecture visited" : "map-prefecture"}
                    onClick={() => isVisited && setPrefecture(name)}
                    role={isVisited ? "button" : undefined}
                    tabIndex={isVisited ? 0 : undefined}
                    onKeyDown={(event) => {
                      if (isVisited && (event.key === "Enter" || event.key === " ")) setPrefecture(name);
                    }}
                  >
                    <title>{name} · {isVisited ? "訪問済み" : "未訪問"}</title>
                    <path d={location.path} />
                  </g>
                );
              })}
            </svg>
            <svg className="memory-constellation" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <filter id="memory-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="1.2" result="glow" />
                  <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <polyline className="memory-path-base" points={constellationPoints} />
              <polyline className="memory-path-travelled" points={travelledPoints} />
            </svg>
            <div className="memory-nodes">
              {completedJourneys.map((journey, index) => {
                const point = displayPoints[index];
                if (!point) return null;
                return (
                  <button
                    key={journey.slug}
                    className={journey.slug === activeJourney.slug ? "active" : ""}
                    style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    onClick={() => {
                      setActiveJourneySlug(journey.slug);
                      setPrefecture(journey.prefecture);
                    }}
                    aria-label={`${journey.number} ${journey.title}`}
                  >
                    <i />
                    <span>{journey.number}</span>
                  </button>
                );
              })}
            </div>
            <span className="map-signature">MEMORIES CONNECTED · 2025 — ∞</span>
            <span className="map-scan" />
            {constellationMode === "chronology" && (
              <div className="chronology-axis" aria-hidden="true">
                <span>2025</span><i /><span>2026</span><i /><span>∞</span>
              </div>
            )}
          </div>
          <div className="memory-console" aria-live="polite">
            <div className="memory-console-head">
              <span>SELECTED MEMORY</span>
              <b>{activeJourney.number}</b>
            </div>
            <p className="memory-prefecture">{activeJourney.prefecture}</p>
            <h3>{activeJourney.title}</h3>
            <p className="memory-date">{activeJourney.date}</p>
            <p className="memory-area">{activeJourney.area}</p>
            <div className="memory-pulse"><i /><span>ARCHIVED</span></div>
            <Link href={`/journeys/${activeJourney.slug}`}>記憶を開く <span>↗</span></Link>
            <div className="memory-sequence">
              {completedJourneys.map((journey) => (
                <button
                  key={journey.slug}
                  className={journey.slug === activeJourney.slug ? "active" : ""}
                  onClick={() => setActiveJourneySlug(journey.slug)}
                >
                  {journey.number}
                </button>
              ))}
            </div>
            <label className="memory-scrubber">
              <span>TIME SCRUBBER</span>
              <input
                type="range"
                min="0"
                max={completedJourneys.length - 1}
                value={activeJourneyIndex}
                onChange={(event) => {
                  const journey = completedJourneys[Number(event.target.value)];
                  if (journey) {
                    setActiveJourneySlug(journey.slug);
                    setPrefecture(journey.prefecture);
                  }
                }}
              />
              <output>{activeJourney.number} · {activeJourney.date.slice(0, 10)}</output>
            </label>
          </div>
        </div>
        <div className="map-legend">
          <span><i className="visited-dot" />訪問済み</span>
          <span><i />未訪問</span>
          <span className="constellation-legend">01—{completedJourneys.at(-1)?.number ?? "—"} · Journey sequence</span>
        </div>
      </section>

      <section className="rankings section" id="rankings">
        <div className="section-heading">
          <div>
            <p className="section-index">005 — EDITOR&apos;S SELECTION</p>
            <h2>旅のベスト</h2>
          </div>
          <p>記録済みの旅から選出</p>
        </div>
        <div className="ranking-columns">
          <div>
            <p className="ranking-label">BEST PHOTOGRAPH</p>
            {rankedPhotos.map((journey, index) => (
              <Link href={`/journeys/${journey.slug}`} className="ranking-row" key={journey.slug}>
                <b>0{index + 1}</b><span>{journey.bestPhoto}</span><small>{journey.title}</small>
              </Link>
            ))}
          </div>
          <div>
            <p className="ranking-label">BEST FOOD</p>
            {rankedFoods.map((journey, index) => (
              <Link href={`/journeys/${journey.slug}`} className="ranking-row" key={journey.slug}>
                <b>0{index + 1}</b><span>{journey.bestFood}</span><small>{journey.title}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="statistics section" id="statistics">
        <div className="section-heading">
          <div>
            <p className="section-index">006 — ARCHIVE NOTES</p>
            <h2>数字で見る旅</h2>
          </div>
          <p>登録データから自動集計</p>
        </div>
        <div className="stat-grid">
          <article><span>Journeys</span><strong>{completedJourneys.length}</strong><small>実施済みの旅行</small></article>
          <article><span>Prefectures</span><strong>{visited.size}</strong><small>都道府県</small></article>
          <article><span>Recorded cost</span><strong>¥{total.toLocaleString("ja-JP")}</strong><small>現在の登録合計</small></article>
          <article><span>Average</span><strong>¥{Math.round(total / completedJourneys.length).toLocaleString("ja-JP")}</strong><small>1旅行あたり</small></article>
        </div>
        <p className="privacy-note">費用は現在登録されている予約費用・総費用の合計です。現地支出が未整理の旅は、追記すると自動で更新されます。</p>
      </section>

      <section className="exif-cta section">
        <div>
          <p className="section-index">007 — PHOTO LOCATION</p>
          <h2>写真から、旅の場所へ。</h2>
          <p>元写真に残った撮影日時とGPSを、端末内だけで確認できます。</p>
        </div>
        <Link href="/photo-map">EXIFを確認する →</Link>
      </section>
    </>
  );
}

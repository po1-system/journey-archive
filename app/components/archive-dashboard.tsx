"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Journey } from "../data/journeys";
import { mitoJourney, prefectureRegions } from "../archive-config";

type ArchiveJourney = Pick<Journey, "slug" | "number" | "prefecture" | "title" | "area" | "date" | "duration" | "year" | "totalCost" | "image" | "bestPhoto" | "bestFood" | "bestPlace">;

export default function ArchiveDashboard({ journeys }: { journeys: ArchiveJourney[] }) {
  const allJourneys = useMemo(() => [...journeys, mitoJourney as ArchiveJourney], [journeys]);
  const [year, setYear] = useState("すべて");
  const [prefecture, setPrefecture] = useState("すべて");
  const years = [...new Set(allJourneys.map((journey) => journey.year))].sort();
  const prefectures = [...new Set(allJourneys.map((journey) => journey.prefecture))];
  const filtered = allJourneys.filter((journey) =>
    (year === "すべて" || journey.year === Number(year)) &&
    (prefecture === "すべて" || journey.prefecture === prefecture)
  );
  const visited = new Set(allJourneys.map((journey) => journey.prefecture));
  const total = allJourneys.reduce((sum, journey) => sum + journey.totalCost, 0);
  const rankedPhotos = allJourneys.filter((journey) => journey.bestPhoto);
  const rankedFoods = allJourneys.filter((journey) => journey.bestFood);

  return (
    <>
      <section className="archive-tools section" id="explore">
        <div className="section-heading">
          <div>
            <p className="section-index">003 — EXPLORE</p>
            <h2>旅を探す</h2>
          </div>
          <p>{filtered.length} journeys</p>
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
              <div className="journey-card-image" style={{ backgroundImage: `url("${journey.image}")` }} />
              <div>
                <span>{journey.number} · {journey.date}</span>
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
            <p className="section-index">004 — VISITED MAP</p>
            <h2>旅した日本</h2>
          </div>
          <p>{visited.size} / 47 prefectures</p>
        </div>
        <div className="japan-map" role="img" aria-label={`訪問済み${visited.size}都道府県を色付けした日本地図`}>
          {prefectureRegions.map((item) => (
            <button
              key={item.name}
              className={visited.has(item.name) ? "prefecture visited" : "prefecture"}
              style={{ left: `${item.x + 16}%`, top: `${(item.y - 4) * 0.78}%` }}
              title={`${item.name}${visited.has(item.name) ? "・訪問済み" : "・未訪問"}`}
              onClick={() => visited.has(item.name) && setPrefecture(item.name)}
            >
              <span>{item.name.replace(/[都道府県]/g, "")}</span>
            </button>
          ))}
        </div>
        <div className="map-legend"><span><i className="visited-dot" />訪問済み</span><span><i />未訪問</span></div>
      </section>

      <section className="rankings section" id="rankings">
        <div className="section-heading">
          <div>
            <p className="section-index">005 — BEST OF JOURNEYS</p>
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
            <p className="section-index">006 — STATISTICS</p>
            <h2>数字で見る旅</h2>
          </div>
          <p>登録データから自動集計</p>
        </div>
        <div className="stat-grid">
          <article><span>Journeys</span><strong>{allJourneys.length}</strong><small>旅行</small></article>
          <article><span>Prefectures</span><strong>{visited.size}</strong><small>都道府県</small></article>
          <article><span>Recorded cost</span><strong>¥{total.toLocaleString("ja-JP")}</strong><small>現在の登録合計</small></article>
          <article><span>Average</span><strong>¥{Math.round(total / allJourneys.length).toLocaleString("ja-JP")}</strong><small>1旅行あたり</small></article>
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

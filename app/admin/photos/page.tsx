"use client";

import Link from "next/link";
import { useState } from "react";
import * as exifr from "exifr";
import JSZip from "jszip";

type Candidate = {
  id: string;
  file: File;
  preview: string;
  journey: string;
  day: number;
  place: string;
  takenAt: string;
  latitude?: number;
  longitude?: number;
  caption: string;
  selected: boolean;
};

type ManifestPhoto = {
  id: string;
  journey: string;
  day: number;
  place: string;
  takenAt?: string;
  src: string;
  caption?: string;
};

const journeyOptions = [
  { slug: "kagawa", label: "香川｜三豊・高松・小豆島", start: "2025-11-17", end: "2025-11-19" },
  { slug: "fukuoka", label: "福岡｜福岡市", start: "2026-01-26", end: "2026-01-27" },
  { slug: "hiroshima", label: "広島｜広島市・宮島", start: "2026-03-23", end: "2026-03-24" },
  { slug: "okinawa", label: "沖縄｜那覇・北谷", start: "2026-04-13", end: "2026-04-14" },
  { slug: "wakayama", label: "和歌山｜白浜・和歌山市", start: "2026-04-20", end: "2026-04-21" },
  { slug: "ishikawa", label: "石川｜金沢・小松", start: "2026-05-11", end: "2026-05-12" },
  { slug: "hakodate", label: "北海道｜函館", start: "2026-06-15", end: "2026-06-17" },
  { slug: "mito-oarai", label: "茨城｜水戸・大洗", start: "2026-07-27", end: "2026-07-28" },
];

const knownPlaces = [
  { journey: "kagawa", name: "父母ヶ浜", lat: 34.219, lon: 133.646 },
  { journey: "fukuoka", name: "櫛田神社", lat: 33.593, lon: 130.410 },
  { journey: "fukuoka", name: "中洲", lat: 33.593, lon: 130.406 },
  { journey: "hiroshima", name: "厳島神社", lat: 34.296, lon: 132.319 },
  { journey: "hiroshima", name: "平和記念公園", lat: 34.392, lon: 132.453 },
  { journey: "okinawa", name: "アメリカンビレッジ", lat: 26.315, lon: 127.758 },
  { journey: "okinawa", name: "国際通り", lat: 26.215, lon: 127.684 },
  { journey: "wakayama", name: "白浜", lat: 33.681, lon: 135.348 },
  { journey: "ishikawa", name: "金沢市内", lat: 36.561, lon: 136.656 },
  { journey: "hakodate", name: "函館山", lat: 41.759, lon: 140.704 },
  { journey: "hakodate", name: "五稜郭", lat: 41.796, lon: 140.756 },
  { journey: "mito-oarai", name: "神磯の鳥居", lat: 36.316, lon: 140.589 },
  { journey: "mito-oarai", name: "千波湖", lat: 36.365, lon: 140.455 },
  { journey: "mito-oarai", name: "偕楽園", lat: 36.373, lon: 140.452 },
];

function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const rad = Math.PI / 180;
  const x = (bLon - aLon) * rad * Math.cos(((aLat + bLat) / 2) * rad);
  const y = (bLat - aLat) * rad;
  return Math.sqrt(x * x + y * y) * 6371;
}

function classify(date?: Date, latitude?: number, longitude?: number) {
  const iso = date ? date.toISOString().slice(0, 10) : "";
  const journey = journeyOptions.find((item) => iso >= item.start && iso <= item.end);
  if (!journey) return { journey: "", day: 1, place: "" };
  const day = Math.max(1, Math.round((new Date(iso).getTime() - new Date(journey.start).getTime()) / 86400000) + 1);
  let place = "";
  if (latitude != null && longitude != null) {
    const nearest = knownPlaces
      .filter((item) => item.journey === journey.slug)
      .map((item) => ({ ...item, distance: distanceKm(latitude, longitude, item.lat, item.lon) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (nearest && nearest.distance < 12) place = nearest.name;
  }
  return { journey: journey.slug, day, place };
}

async function resizeToWebp(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 2200;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("画像変換に失敗しました")), "image/webp", .86)
  );
  return blob;
}

export default function PhotoPublisherPage() {
  const [photos, setPhotos] = useState<Candidate[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function inspect(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    setStatus("写真の撮影情報を解析しています…");
    const candidates = await Promise.all([...files].map(async (file, index) => {
      const info = await exifr.parse(file, { gps: true, exif: true }).catch(() => undefined);
      const taken = info?.DateTimeOriginal instanceof Date ? info.DateTimeOriginal : undefined;
      const result = classify(taken, info?.latitude, info?.longitude);
      return {
        id: `${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
        journey: result.journey,
        day: result.day,
        place: result.place,
        takenAt: taken?.toLocaleString("ja-JP") ?? "",
        latitude: info?.latitude,
        longitude: info?.longitude,
        caption: "",
        selected: Boolean(result.journey),
      };
    }));
    setPhotos(candidates);
    setStatus(`${candidates.length}枚を解析しました。分類結果を確認してください。`);
    setBusy(false);
  }

  function update(id: string, patch: Partial<Candidate>) {
    setPhotos((current) => current.map((photo) => photo.id === id ? { ...photo, ...patch } : photo));
  }

  async function createPublishPack() {
    const selected = photos.filter((photo) => photo.selected && photo.journey);
    if (selected.length === 0) return;
    setBusy(true);
    try {
      const zip = new JSZip();
      const additions: ManifestPhoto[] = [];

      for (let index = 0; index < selected.length; index++) {
        const photo = selected[index];
        setStatus(`${index + 1} / ${selected.length}枚をWeb用に変換しています…`);
        const webp = await resizeToWebp(photo.file);
        const safeId = `${new Date().toISOString().slice(0, 10)}-${photo.id}`;
        const path = `photos/${photo.journey}/${safeId}.webp`;
        zip.file(path, webp);
        additions.push({
          id: safeId,
          journey: photo.journey,
          day: photo.day,
          place: photo.place,
          takenAt: photo.takenAt || undefined,
          src: `/photos/${photo.journey}/${safeId}.webp`,
          caption: photo.caption || undefined,
        });
      }
      zip.file("manifest.json", JSON.stringify(additions, null, 2));
      zip.file("README.txt", "Journey Archive 公開用写真パック\nこのZIPをCodexの旅行サイト作成タスクへ添付し、「写真を公開して」と依頼してください。\n");
      const pack = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(pack);
      link.download = `journey-photos-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      setStatus("公開用パックを作成しました。このZIPをCodexへ添付して「写真を公開して」と送ってください。");
    } catch (error) {
      setStatus(`公開用パックを作成できませんでした：${error instanceof Error ? error.message : "不明なエラー"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="photo-admin-page">
      <header className="site-header story-header">
        <Link href="/" className="brand">Journey Archive</Link>
        <Link href="/" className="back-link">← Public site</Link>
      </header>
      <section className="admin-hero">
        <p className="eyebrow">Private Photo Publisher</p>
        <h1>写真を、<br />旅のページへ。</h1>
        <p>撮影日とGPSを読み取り、旅行・日程・場所を自動分類します。確認した写真だけを公開できます。</p>
        <label className="upload-button">写真を選ぶ
          <input type="file" accept="image/jpeg,image/png,image/heic,image/heif,image/tiff" multiple onChange={(event) => inspect(event.target.files)} />
        </label>
        {status && <p className="admin-status">{status}</p>}
      </section>

      {photos.length > 0 && (
        <section className="admin-review section">
          <div className="section-heading">
            <div><p className="section-index">REVIEW BEFORE PUBLISH</p><h2>配置を確認</h2></div>
            <p>{photos.filter((photo) => photo.selected).length} / {photos.length} selected</p>
          </div>
          <div className="admin-photo-list">
            {photos.map((photo) => (
              <article key={photo.id} className={photo.selected ? "selected" : ""}>
                {/* Local blob previews cannot be handled by next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt="" />
                <div className="admin-photo-fields">
                  <label className="publish-check"><input type="checkbox" checked={photo.selected} onChange={(event) => update(photo.id, { selected: event.target.checked })} />公開する</label>
                  <label>旅行
                    <select value={photo.journey} onChange={(event) => update(photo.id, { journey: event.target.value, selected: Boolean(event.target.value) })}>
                      <option value="">未分類</option>
                      {journeyOptions.map((journey) => <option value={journey.slug} key={journey.slug}>{journey.label}</option>)}
                    </select>
                  </label>
                  <label>日程
                    <select value={photo.day} onChange={(event) => update(photo.id, { day: Number(event.target.value) })}>
                      {[1, 2, 3].map((day) => <option value={day} key={day}>Day {day}</option>)}
                    </select>
                  </label>
                  <label>撮影場所<input value={photo.place} onChange={(event) => update(photo.id, { place: event.target.value })} placeholder="例：神磯の鳥居" /></label>
                  <label>一言メモ<input value={photo.caption} onChange={(event) => update(photo.id, { caption: event.target.value })} placeholder="任意" /></label>
                  <p>{photo.takenAt || "撮影日時なし"} · {photo.latitude != null ? "GPSあり" : "GPSなし"}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="publish-panel safe-pack-panel">
            <div>
              <h3>公開用パックを作成</h3>
              <p>確認した写真をWeb用に縮小し、配置情報と一緒に1つのZIPへまとめます。完成したZIPをCodexへ添付すると、連携済みのGitHub認証で安全に公開できます。</p>
            </div>
            <button onClick={createPublishPack} disabled={busy || !photos.some((photo) => photo.selected && photo.journey)}>公開用ZIPを作る</button>
          </div>
          <p className="privacy-note">画像は公開前にWebPへ変換されるため、元写真のGPSを含むEXIF情報は公開ファイルへ引き継がれません。</p>
        </section>
      )}
    </main>
  );
}

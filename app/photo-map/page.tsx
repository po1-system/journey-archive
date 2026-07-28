"use client";

import Link from "next/link";
import { useState } from "react";
import * as exifr from "exifr";

type PhotoInfo = {
  name: string;
  preview: string;
  takenAt?: string;
  latitude?: number;
  longitude?: number;
};

export default function PhotoMapPage() {
  const [photos, setPhotos] = useState<PhotoInfo[]>([]);
  const [reading, setReading] = useState(false);

  async function readPhotos(files: FileList | null) {
    if (!files) return;
    setReading(true);
    const results = await Promise.all([...files].map(async (file) => {
      const data = await exifr.parse(file, { gps: true, exif: true }).catch(() => undefined);
      return {
        name: file.name,
        preview: URL.createObjectURL(file),
        takenAt: data?.DateTimeOriginal?.toLocaleString?.("ja-JP"),
        latitude: data?.latitude,
        longitude: data?.longitude,
      };
    }));
    setPhotos(results);
    setReading(false);
  }

  return (
    <main className="photo-map-page">
      <header className="site-header story-header">
        <Link href="/" className="brand">Journey Archive</Link>
        <Link href="/#explore" className="back-link">← Archive</Link>
      </header>
      <section className="photo-map-hero">
        <p className="eyebrow">Private EXIF Reader</p>
        <h1>写真から、<br />旅の場所を読む。</h1>
        <p>選んだ写真は外部へ送信されません。このブラウザの中だけで撮影情報を読み取ります。</p>
        <label className="upload-button">
          写真を選ぶ
          <input type="file" accept="image/jpeg,image/heic,image/heif,image/tiff" multiple onChange={(event) => readPhotos(event.target.files)} />
        </label>
        {reading && <span className="reading">撮影情報を確認中…</span>}
      </section>
      {photos.length > 0 && (
        <section className="photo-results section">
          <div className="section-heading">
            <div><p className="section-index">PHOTO RECORDS</p><h2>撮影情報</h2></div>
            <p>{photos.length} photos</p>
          </div>
          <div className="photo-result-grid">
            {photos.map((photo) => (
              <article key={`${photo.name}-${photo.preview}`}>
                {/* Local object URLs never leave the browser. */}
                {/* Blob URLs are local previews and cannot be handled by next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt="" />
                <div>
                  <h3>{photo.name}</h3>
                  <p>{photo.takenAt ?? "撮影日時なし"}</p>
                  {photo.latitude != null && photo.longitude != null ? (
                    <>
                      <p>{photo.latitude.toFixed(5)}, {photo.longitude.toFixed(5)}</p>
                      <a href={`https://www.openstreetmap.org/?mlat=${photo.latitude}&mlon=${photo.longitude}#map=16/${photo.latitude}/${photo.longitude}`} target="_blank" rel="noreferrer">地図で確認 ↗</a>
                    </>
                  ) : <p>GPS位置情報なし</p>}
                </div>
              </article>
            ))}
          </div>
          <p className="privacy-note">公開ページへ載せる前に、自宅や職場など旅行外の位置情報が混ざっていないか確認してください。</p>
        </section>
      )}
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PHOTO_API } from "../../components/journey-gallery";

type Candidate = {
  id: string;
  file: File;
  preview: string;
  journey: string;
  day: number;
  place: string;
  caption: string;
  placement: "hero" | "motion";
  selected: boolean;
};

const journeys = [
  ["kagawa", "香川｜三豊・高松・小豆島"],
  ["fukuoka", "福岡｜福岡市"],
  ["hiroshima", "広島｜広島市・宮島"],
  ["okinawa", "沖縄｜那覇・北谷"],
  ["wakayama", "和歌山｜白浜・和歌山市"],
  ["ishikawa", "石川｜金沢・小松"],
  ["hakodate", "北海道｜函館"],
  ["mito-oarai", "茨城｜水戸・大洗"],
  ["nagano", "長野｜実施済み・整理中"],
  ["sapporo-otaru", "札幌・小樽｜予定"],
] as const;

const maxVideoBytes = 20_000_000;

export default function VideoPublisherPage() {
  const [videos, setVideos] = useState<Candidate[]>([]);
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setAdminKey(localStorage.getItem("journeyArchiveAdminKey") ?? ""), []);

  function inspect(files: FileList | null) {
    if (!files) return;
    const accepted: Candidate[] = [];
    const rejected: string[] = [];
    [...files].forEach((file, index) => {
      if (file.type !== "video/mp4") {
        rejected.push(`${file.name}（MP4ではありません）`);
        return;
      }
      if (file.size > maxVideoBytes) {
        rejected.push(`${file.name}（20MBを超えています）`);
        return;
      }
      accepted.push({
        id: `${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18)}`,
        file,
        preview: URL.createObjectURL(file),
        journey: "",
        day: 1,
        place: "",
        caption: "",
        placement: "motion",
        selected: false,
      });
    });
    setVideos(accepted);
    setStatus(rejected.length ? `${accepted.length}本を追加しました。${rejected.join("、")} は追加していません。` : `${accepted.length}本を追加しました。旅と配置先を選んでください。`);
  }

  function update(id: string, patch: Partial<Candidate>) {
    setVideos((current) => current.map((video) => video.id === id ? { ...video, ...patch } : video));
  }

  async function publish() {
    const selected = videos.filter((video) => video.selected && video.journey);
    if (selected.length === 0 || !adminKey.trim()) {
      setStatus("公開する動画、旅行先、管理パスコードを確認してください。");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      const additions = selected.map((video, index) => {
        const id = `${new Date().toISOString().slice(0, 10)}-video-${Date.now()}-${index}`;
        form.append(id, video.file, `${id}.mp4`);
        return {
          id,
          journey: video.journey,
          day: video.day,
          place: video.place,
          src: `${PHOTO_API}/media/${encodeURIComponent(id)}`,
          caption: video.caption || undefined,
          placement: video.placement,
          mediaType: "video" as const,
        };
      });
      form.append("manifest", JSON.stringify(additions));
      setStatus("動画を旅のページへ公開しています…");
      const response = await fetch(`${PHOTO_API}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminKey.trim()}` },
        body: form,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "公開に失敗しました");
      localStorage.setItem("journeyArchiveAdminKey", adminKey.trim());
      setVideos([]);
      setStatus(`${result.published ?? selected.length}本を公開しました。旅行ページを再読み込みすると反映されます。`);
    } catch (error) {
      setStatus(`公開できませんでした：${error instanceof Error ? error.message : "不明なエラー"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="photo-admin-page video-admin-page">
      <header className="site-header story-header">
        <Link href="/" className="brand">Journey Archive</Link>
        <Link href="/admin/photos" className="back-link">← 写真を公開</Link>
      </header>
      <section className="admin-hero">
        <p className="eyebrow">Private Motion Publisher</p>
        <h1>動画を、<br />旅の時間へ。</h1>
        <p>短いMP4動画を、旅のページへ直接公開します。通常は「Motion」を選び、表紙動画にしたいときだけ「Hero」を選択してください。</p>
        <label className="upload-button">動画を選ぶ
          <input type="file" accept="video/mp4" multiple onChange={(event) => inspect(event.target.files)} />
        </label>
        <p className="upload-hint">MP4（H.264推奨）・1本20MBまで。長い動画は20〜60秒程度に切り出してください。</p>
        {status && <p className="admin-status">{status}</p>}
      </section>

      {videos.length > 0 && (
        <section className="admin-review section">
          <div className="section-heading">
            <div><p className="section-index">REVIEW BEFORE PUBLISH</p><h2>配置を確認</h2></div>
            <p>{videos.filter((video) => video.selected).length} / {videos.length} selected</p>
          </div>
          <div className="admin-photo-list admin-video-list">
            {videos.map((video) => (
              <article key={video.id} className={video.selected ? "selected" : ""}>
                <video src={video.preview} controls playsInline preload="metadata" />
                <div className="admin-photo-fields">
                  <label className="publish-check"><input type="checkbox" checked={video.selected} onChange={(event) => update(video.id, { selected: event.target.checked })} />公開する</label>
                  <label>旅行
                    <select value={video.journey} onChange={(event) => update(video.id, { journey: event.target.value, selected: Boolean(event.target.value) })}>
                      <option value="">未分類</option>
                      {journeys.map(([slug, label]) => <option value={slug} key={slug}>{label}</option>)}
                    </select>
                  </label>
                  <label>日程
                    <select value={video.day} onChange={(event) => update(video.id, { day: Number(event.target.value) })}>
                      {[1, 2, 3].map((day) => <option value={day} key={day}>Day {day}</option>)}
                    </select>
                  </label>
                  <label>配置先
                    <select value={video.placement} onChange={(event) => update(video.id, { placement: event.target.value as Candidate["placement"] })}>
                      <option value="motion">Motion｜ページ内の動画記録</option>
                      <option value="hero">Hero｜ページ表紙の無音ループ</option>
                    </select>
                  </label>
                  <label>撮影場所<input value={video.place} onChange={(event) => update(video.id, { place: event.target.value })} placeholder="例：函館山" /></label>
                  <label>一言メモ<input value={video.caption} onChange={(event) => update(video.id, { caption: event.target.value })} placeholder="例：夜景へ移り変わる時間" /></label>
                </div>
              </article>
            ))}
          </div>
          <div className="publish-panel direct-publish-panel">
            <div>
              <h3>この画面から直接公開</h3>
              <p>動画はMP4のまま公開されます。公開後は各旅行ページの「Motion」に表示されます。</p>
            </div>
            <label className="admin-key-field">管理パスコード
              <input type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="初回のみ入力" autoComplete="current-password" />
            </label>
            <button onClick={publish} disabled={busy || !adminKey.trim() || !videos.some((video) => video.selected && video.journey)}>動画を公開する</button>
          </div>
        </section>
      )}
    </main>
  );
}

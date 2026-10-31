"use client";

import { useEffect, useRef, useState } from "react";

export default function PwaClient() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [offline, setOffline] = useState(false);
  const [applying, setApplying] = useState(false);
  const reloadRequested = useRef(false);
  useEffect(() => {
    const connection = () => setOffline(!navigator.onLine);
    connection();
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    if (process.env.NODE_ENV !== "production" || !window.isSecureContext || !("serviceWorker" in navigator)) {
      return () => { window.removeEventListener("online", connection); window.removeEventListener("offline", connection); };
    }
    let cancelled = false;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const changed = () => { if (reloadRequested.current) location.reload(); };
    navigator.serviceWorker.addEventListener("controllerchange", changed);
    const register = () => {
      void navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/`, updateViaCache: "none" }).then(reg => {
        if (cancelled) return;
        if (reg.waiting) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (!cancelled && worker.state === "installed" && navigator.serviceWorker.controller) setWaiting(reg.waiting);
          });
        });
      }).catch(() => { /* Online browsing remains available if storage/registration is unavailable. */ });
    };
    // Do not compete with the first photo or first paint.
    const schedule = () => { timer = window.setTimeout(register, 1200); };
    let timer: number | undefined;
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("load", schedule);
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
      navigator.serviceWorker.removeEventListener("controllerchange", changed);
    };
  }, []);
  // Never interrupt photo/video editing with a reload prompt.
  const admin = typeof location !== "undefined" && location.pathname.includes("/admin/");
  return <>
    {offline && <div className="pwa-offline" role="status">オフライン · 保存済みのページを表示します。写真・動画には通信が必要です。</div>}
    {waiting && !admin && <aside className="pwa-update" aria-label="アプリの更新">
      <p>新しい旅のアーカイブを利用できます。</p>
      <button disabled={applying} onClick={() => { reloadRequested.current = true; setApplying(true); waiting.postMessage({ type: "SKIP_WAITING" }); }}>{applying ? "更新中…" : "更新して開き直す"}</button>
      <button disabled={applying} onClick={() => setWaiting(null)}>あとで</button>
    </aside>}
  </>;
}

export function InstallGuide() {
  const [standalone, setStandalone] = useState(false);
  const [status, setStatus] = useState("オンラインで利用できます");
  const [clearing, setClearing] = useState(false);
  useEffect(() => {
    const display = matchMedia("(display-mode: standalone)");
    const update = () => setStandalone(display.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone);
    update();
    display.addEventListener("change", update);
    let mounted = true;
    if ("serviceWorker" in navigator) void navigator.serviceWorker.ready.then(() => { if (mounted) setStatus("オフライン用の画面を保存済み"); });
    return () => { mounted = false; display.removeEventListener("change", update); };
  }, []);
  const clear = () => {
    const worker = navigator.serviceWorker?.controller;
    if (!worker) { setStatus("キャッシュはまだ利用されていません"); return; }
    setClearing(true);
    const channel = new MessageChannel();
    const timeout = window.setTimeout(() => { channel.port1.close(); setClearing(false); setStatus("削除を確認できませんでした。もう一度お試しください"); }, 5000);
    channel.port1.onmessage = () => {
      clearTimeout(timeout); channel.port1.close(); setClearing(false);
      setStatus("閲覧キャッシュを削除しました。写真・下書きは変更していません");
    };
    worker.postMessage({ type: "CLEAR_RUNTIME" }, [channel.port2]);
  };
  return <details className="install-guide">
    <summary>{standalone ? "アプリについて" : "iPhoneのホーム画面に追加"}</summary>
    <div>
      {!standalone && <p>Safariでこのサイトを開き、「共有」→「ホーム画面に追加」→「追加」。「Webアプリとして開く」が表示される場合はオンにしてください。</p>}
      <p>アプリ名は Journey Archive。トップと一度開いた旅行ページをオフラインでも読めます。写真・動画・写真管理はオンライン専用です。</p>
      <p>新しい版は確認してから切り替えます。iPhoneの空き容量などにより保存データが消去されることがあります。</p>
      <p role="status">{status}</p>
      <button disabled={clearing} onClick={clear}>{clearing ? "削除中…" : "閲覧キャッシュを削除"}</button>
    </div>
  </details>;
}

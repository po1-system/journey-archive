"use client";

import { useEffect, useState } from "react";

export type JourneyStop = {
  id: string;
  number: string;
  label: string;
  sublabel: string;
  tone: "dawn" | "day" | "sunset" | "night";
};

export default function CinematicRoute({ stops }: { stops: JourneyStop[] }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const positions = stops.map((stop) => {
        const element = document.getElementById(stop.id);
        return element ? Math.abs(element.getBoundingClientRect().top - window.innerHeight * 0.38) : Infinity;
      });
      const next = positions.indexOf(Math.min(...positions));
      setActive(Math.max(0, next));
      const page = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(page > 0 ? Math.min(1, Math.max(0, window.scrollY / page)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [stops]);

  useEffect(() => {
    document.documentElement.dataset.journeyTone = stops[active]?.tone ?? "day";
    return () => {
      delete document.documentElement.dataset.journeyTone;
    };
  }, [active, stops]);

  return (
    <aside className="cinematic-route" aria-label="旅の現在地">
      <div className="route-status">
        <span>LIVE ROUTE</span>
        <strong>{String(active + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")}</strong>
      </div>
      <div className="route-track" aria-hidden="true">
        <i style={{ height: `${progress * 100}%` }} />
      </div>
      <ol>
        {stops.map((stop, index) => (
          <li className={index === active ? "active" : index < active ? "passed" : ""} key={stop.id}>
            <button onClick={() => document.getElementById(stop.id)?.scrollIntoView({ behavior: "smooth" })}>
              <span>{stop.number}</span>
              <span><b>{stop.label}</b><small>{stop.sublabel}</small></span>
            </button>
          </li>
        ))}
      </ol>
      <div className="route-coordinate">
        <span>36.3659° N</span>
        <span>140.4712° E</span>
      </div>
    </aside>
  );
}

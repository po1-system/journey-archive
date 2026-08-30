"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { JourneyRouteStop } from "../data/home-passage";

type RouteStage = "AT MITO" | "DEPARTURE — MITO" | "TRAVEL" | "APPROACH" | "ARRIVING — NAGANO" | "IN NAGANO";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function stageFor(progress: number): RouteStage {
  if (progress < 0.13) return "AT MITO";
  if (progress < 0.3) return "DEPARTURE — MITO";
  if (progress < 0.62) return "TRAVEL";
  if (progress < 0.77) return "APPROACH";
  if (progress < 0.91) return "ARRIVING — NAGANO";
  return "IN NAGANO";
}

export default function JourneyPassage({ scenes }: { scenes: JourneyRouteStop[] }) {
  const hostRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const mitoLabelRef = useRef<HTMLDivElement | null>(null);
  const naganoLabelRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const [stage, setStage] = useState<RouteStage>("AT MITO");

  useEffect(() => {
    const host = hostRef.current;
    const canvasHost = canvasRef.current;
    if (!host || !canvasHost || scenes.length < 2) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const webglScene = new THREE.Scene();
    webglScene.fog = new THREE.FogExp2(0x080908, 0.018);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 160);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      host.dataset.webgl = "fallback";
      return;
    }
    renderer.setClearColor(0x070807, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.25 : 1.65));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvasHost.appendChild(renderer.domElement);

    const route = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.15, 5.4),
      new THREE.Vector3(-0.8, 0.2, -2),
      new THREE.Vector3(1.7, -0.35, -20),
      new THREE.Vector3(-1.1, 0.45, -40),
      new THREE.Vector3(0.35, 0.1, -53.8),
      new THREE.Vector3(-0.45, -0.1, -64),
    ], false, "centripetal");
    const routeLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(route.getPoints(180)),
      new THREE.LineBasicMaterial({ color: 0xb9a67d, transparent: true, opacity: 0.58 }),
    );
    webglScene.add(routeLine);

    const portalGeometry = new THREE.PlaneGeometry(31, 18);
    const createPortal = (z: number, x = 0) => {
      const portal = new THREE.Mesh(
        portalGeometry,
        new THREE.MeshBasicMaterial({ color: 0x32342f, transparent: true, opacity: 0.98 }),
      );
      portal.position.set(x, 0, z);
      webglScene.add(portal);
      return portal;
    };
    const mitoPortal = createPortal(0);
    const naganoPortal = createPortal(-60, 0.25);

    const textureLoader = new THREE.TextureLoader();
    const loadPortalTexture = (portal: THREE.Mesh, image: string) => {
      textureLoader.load(image, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        const material = portal.material as THREE.MeshBasicMaterial;
        material.map = texture;
        material.needsUpdate = true;
      });
    };
    // Only the current stop and the next stop are loaded for the prototype.
    loadPortalTexture(mitoPortal, scenes[0].image);
    loadPortalTexture(naganoPortal, scenes[1].image);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = window.innerWidth < 700 ? 44 : 120;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      particlePositions[index * 3] = (Math.random() - 0.5) * 22;
      particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 13;
      particlePositions[index * 3 + 2] = -Math.random() * 68 + 5;
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({ color: 0xcbbb99, size: 0.035, transparent: true, opacity: 0.52, sizeAttenuation: true }),
    );
    webglScene.add(particles);

    const positionLabel = (label: HTMLDivElement | null, point: THREE.Vector3, scale = 1) => {
      if (!label) return;
      const projected = point.clone().project(camera);
      const visible = projected.z < 1 && projected.z > -1;
      label.style.opacity = visible ? "1" : "0";
      label.style.left = `${(projected.x * .5 + .5) * 100}%`;
      label.style.top = `${(projected.y * -.5 + .5) * 100}%`;
      label.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };

    let targetProgress = 0;
    let currentProgress = 0;
    let frame = 0;
    let lastStage: RouteStage = "AT MITO";
    const lookAt = new THREE.Vector3();

    const resize = () => {
      const width = canvasHost.clientWidth;
      const height = canvasHost.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const updateTarget = () => {
      const rect = host.getBoundingClientRect();
      const travel = Math.max(host.offsetHeight - window.innerHeight, 1);
      targetProgress = clamp((-rect.top) / travel);
    };
    const render = () => {
      currentProgress += (targetProgress - currentProgress) * 0.075;
      const pathPoint = route.getPointAt(currentProgress);
      const ahead = route.getPointAt(Math.min(currentProgress + 0.018, 1));
      camera.position.copy(pathPoint);
      lookAt.copy(ahead);
      camera.lookAt(lookAt);

      particles.position.z = -currentProgress * 3;
      routeLine.material.opacity = currentProgress > 0.13 && currentProgress < 0.91 ? 0.68 : 0.2;
      (mitoPortal.material as THREE.MeshBasicMaterial).opacity = 1 - clamp((currentProgress - 0.13) * 7);
      (naganoPortal.material as THREE.MeshBasicMaterial).opacity = clamp((currentProgress - 0.56) * 3.1);

      const mitoDistance = camera.position.distanceTo(mitoPortal.position);
      const naganoDistance = camera.position.distanceTo(naganoPortal.position);
      positionLabel(mitoLabelRef.current, mitoPortal.position.clone().add(new THREE.Vector3(0, 0, 0.08)), clamp(1.15 - mitoDistance / 36));
      positionLabel(naganoLabelRef.current, naganoPortal.position.clone().add(new THREE.Vector3(0, 0, 0.08)), clamp(1.15 - naganoDistance / 36));
      if (progressRef.current) progressRef.current.textContent = `${String(Math.round(currentProgress * 100)).padStart(3, "0")}%`;

      const nextStage = stageFor(currentProgress);
      if (nextStage !== lastStage) {
        lastStage = nextStage;
        setStage(nextStage);
      }
      renderer.render(webglScene, camera);
      frame = window.requestAnimationFrame(render);
    };

    resize();
    updateTarget();
    render();
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
      portalGeometry.dispose();
      particlesGeometry.dispose();
      (mitoPortal.material as THREE.MeshBasicMaterial).map?.dispose();
      (naganoPortal.material as THREE.MeshBasicMaterial).map?.dispose();
      (mitoPortal.material as THREE.Material).dispose();
      (naganoPortal.material as THREE.Material).dispose();
      (particles.material as THREE.Material).dispose();
      routeLine.geometry.dispose();
      (routeLine.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete host.dataset.webgl;
    };
  }, [scenes]);

  const inNagano = stage === "ARRIVING — NAGANO" || stage === "IN NAGANO";
  return (
    <section className="journey-route" id="passage" ref={hostRef} aria-label="水戸・大洗から長野へ向かう没入型の旅ルート">
      <div className="journey-route-sticky">
        <div className="journey-route-canvas" ref={canvasRef} aria-hidden="true" />
        <div className="journey-route-shade" aria-hidden="true" />
        <div className="spatial-label spatial-label-mito" ref={mitoLabelRef} aria-hidden="true"><span>{scenes[0]?.number}</span><strong>{scenes[0]?.title}</strong></div>
        <div className="spatial-label spatial-label-nagano" ref={naganoLabelRef} aria-hidden="true"><span>{scenes[1]?.number}</span><strong>{scenes[1]?.title}</strong></div>

        <div className="route-hud"><p>JOURNEY ROUTE / PROTOTYPE 01</p><div><span>{stage}</span><i /><b ref={progressRef}>000%</b></div></div>
        <div className="route-direction" aria-live="polite">
          {stage === "AT MITO" && <><p>008 — ARRIVED</p><h2>水戸・大洗</h2><span>Scroll to depart</span></>}
          {stage === "DEPARTURE — MITO" && <><p>DEPARTURE</p><h2>水戸を出発</h2><span>MITO / OARAI → NAGANO</span></>}
          {stage === "TRAVEL" && <><p>TRAVEL</p><h2>旅の途中</h2><span>ROUTE IN PROGRESS</span></>}
          {stage === "APPROACH" && <><p>APPROACH</p><h2>長野が見えてくる</h2><span>NAGANO / NEXT DESTINATION</span></>}
          {stage === "ARRIVING — NAGANO" && <><p>ARRIVING</p><h2>長野へ</h2><span>2026.08.17 — 08.18</span></>}
          {stage === "IN NAGANO" && <><p>009 — ARRIVED</p><h2>長野</h2><span>2026.08.17 — 08.18</span></>}
        </div>
        <div className={`route-arrival${inNagano ? " is-visible" : ""}`}><p>009 / 長野県</p><Link href={scenes[1]?.href ?? "/journeys/nagano"}>VIEW JOURNEY <span>→</span></Link></div>
        <div className="route-fallback">
          {scenes.map((scene) => <Link href={scene.href} className="route-fallback-card" key={scene.slug} style={{ backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.62), transparent), url("${scene.image}")` }}><small>{scene.number} · {scene.prefecture}</small><strong>{scene.title}</strong><span>{scene.date}</span></Link>)}
        </div>
      </div>
    </section>
  );
}

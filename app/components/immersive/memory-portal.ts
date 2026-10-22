import * as THREE from "three";
import { MercatorCoordinate, type CustomLayerInterface, type Map as MapLibreMap } from "maplibre-gl";
import type { JourneyRouteStop } from "../../data/home-passage";

/** One geographic plane, sharing MapLibre's depth buffer and camera. */
export function createMemoryPortal(basePath: string, compact: boolean) {
  const scene = new THREE.Scene(), camera = new THREE.Camera();
  const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const geometry = new THREE.PlaneGeometry(1200, 750);
  const plane = new THREE.Mesh(geometry, material);
  const borderGeometry = new THREE.EdgesGeometry(geometry);
  const borderMaterial = new THREE.LineBasicMaterial({ color: 0xd0bd97, transparent: true, opacity: 0 });
  plane.add(new THREE.LineSegments(borderGeometry, borderMaterial)); scene.add(plane);
  let map: MapLibreMap, renderer: THREE.WebGLRenderer | undefined;
  let current: JourneyRouteStop | undefined, source = "", texture: THREE.Texture | undefined;
  let request: AbortController | undefined, dead = false;
  const matrix = new THREE.Matrix4();

  function applyTexture(next: THREE.Texture) {
    if (dead) { next.dispose(); return; }
    texture?.dispose(); texture = next; texture.colorSpace = THREE.SRGBColorSpace;
    material.map = texture; material.needsUpdate = true; map?.triggerRepaint();
  }
  function emptyTexture(stop: JourneyRouteStop) {
    const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 640;
    const context = canvas.getContext("2d")!;
    const gradient = context.createLinearGradient(0, 0, 1024, 640);
    gradient.addColorStop(0, "#2a4548"); gradient.addColorStop(1, "#111f2a");
    context.fillStyle = gradient; context.fillRect(0, 0, 1024, 640);
    context.textAlign = "center"; context.fillStyle = "#c9b894"; context.font = "18px sans-serif";
    context.fillText("MEMORY PORTAL", 512, 240);
    context.font = "48px Georgia"; context.fillStyle = "#f3eee3"; context.fillText(stop.title, 512, 330, 900);
    context.font = "20px sans-serif"; context.fillStyle = "#b5c6c3"; context.fillText("あなたの旅の写真を、ここへ。", 512, 400);
    return new THREE.CanvasTexture(canvas);
  }
  const layer: CustomLayerInterface = {
    id: "memory-portal", type: "custom", renderingMode: "3d",
    onAdd(instance, gl) {
      map = instance;
      renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl });
      renderer.autoClear = false;
    },
    render(_gl, args) {
      if (!current || !renderer || material.opacity <= 0) return;
      const ground = map.queryTerrainElevation([current.longitude, current.latitude]) ?? 0;
      const origin = MercatorCoordinate.fromLngLat([current.longitude, current.latitude], ground + 500);
      const scale = origin.meterInMercatorCoordinateUnits();
      matrix.makeTranslation(origin.x, origin.y, origin.z).scale(new THREE.Vector3(scale, -scale, scale));
      plane.rotation.set(map.getPitch() * Math.PI / 180, 0, -map.getBearing() * Math.PI / 180, "ZXY");
      camera.projectionMatrix.fromArray(args.defaultProjectionData.mainMatrix).multiply(matrix);
      renderer.resetState(); renderer.render(scene, camera);
    },
    onRemove() {
      dead = true; request?.abort(); texture?.dispose(); geometry.dispose(); borderGeometry.dispose(); material.dispose(); borderMaterial.dispose(); renderer?.dispose();
    },
  };
  return {
    layer,
    show(stop: JourneyRouteStop | undefined, opacity: number) {
      material.opacity = opacity; borderMaterial.opacity = opacity * .8;
      if (!stop) { material.opacity = 0; return; }
      const key = `${stop.slug}:${stop.image ?? ""}`;
      current = stop;
      if (key === source) return;
      source = key; request?.abort(); applyTexture(emptyTexture(stop));
      if (!stop.image) return;
      const controller = new AbortController(); request = controller;
      const url = stop.image.startsWith("/") ? `${basePath}${stop.image}` : stop.image;
      fetch(url, { signal: controller.signal }).then(r => { if (!r.ok) throw Error("Photo unavailable"); return r.blob(); }).then(async blob => {
        const bitmap = await createImageBitmap(blob);
        if (dead || controller.signal.aborted) { bitmap.close(); return; }
        const canvas = document.createElement("canvas"); canvas.width = compact ? 1024 : 1600; canvas.height = canvas.width / 1.6;
        const ratio = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
        canvas.getContext("2d")!.drawImage(bitmap, (canvas.width - bitmap.width * ratio) / 2, (canvas.height - bitmap.height * ratio) / 2, bitmap.width * ratio, bitmap.height * ratio);
        bitmap.close(); applyTexture(new THREE.CanvasTexture(canvas));
      }).catch(() => { /* Keep a truthful empty memory frame on image failure. */ });
    },
  };
}

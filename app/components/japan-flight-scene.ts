import * as THREE from "three";
import type { JourneyRouteStop } from "../data/home-passage";
import { clamp, ease, flightState, project } from "./flight-math";

type Land = { features: { properties: { name: string }; geometry: { type: string; coordinates: number[][][][] | number[][][] } }[] };
type Options = {
  canvasHost: HTMLDivElement; host: HTMLElement; stops: JourneyRouteStop[]; basePath: string;
  getStops: () => JourneyRouteStop[];
  onFrame: (progress: number, state: ReturnType<typeof flightState>) => void;
  onReady: () => void; onError: () => void;
};

export async function createJapanFlight(options: Options) {
  const { host, canvasHost, stops, basePath } = options;
  const abort = new AbortController();
  let dead = false, active = false, frame = 0, current = 0, target = 0, previousTime = 0;
  const compact = matchMedia("(max-width: 700px)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: !compact, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.25 : 1.75));
  renderer.setClearColor(0x0b1720);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  canvasHost.appendChild(renderer.domElement);
  const world = new THREE.Scene();
  world.fog = new THREE.Fog(0x0b1720, 360, 1400);
  const camera = new THREE.PerspectiveCamera(43, 1, .06, 2400);
  world.add(new THREE.HemisphereLight(0xd5e8e9, 0x142628, 2.5));
  const sun = new THREE.DirectionalLight(0xffebcf, 3);
  sun.position.set(-130, 220, 150); world.add(sun);
  const ownedTextures = new Set<THREE.Texture>();
  const points = stops.map((stop) => { const [x, z] = project(stop.longitude, stop.latitude); return new THREE.Vector3(x, 0, z); });
  const normal = new THREE.Vector3(0, .67, .742).normalize();
  const photoCenters = points.map((p) => p.clone().add(new THREE.Vector3(0, 5, 0)));
  const neutralRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  const colorLand = new THREE.MeshStandardMaterial({ color: 0x426361, roughness: .9, metalness: .12 });
  const neighborLand = new THREE.MeshStandardMaterial({ color: 0x1e353c, roughness: 1 });
  const shoreMaterial = new THREE.LineBasicMaterial({ color: 0x97b3a1, transparent: true, opacity: .4 });

  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(2100, 2100), new THREE.MeshBasicMaterial({ color: 0x0b1720 }));
  ocean.rotation.x = -Math.PI / 2; ocean.position.y = -.7; world.add(ocean);
  // Graticule is geographic (2° spacing), kept faint to preserve aerial depth.
  const grid: THREE.Vector3[] = [];
  for (let lon = 118; lon <= 154; lon += 2) {
    const a = project(lon, 20), b = project(lon, 49);
    grid.push(new THREE.Vector3(a[0], -.5, a[1]), new THREE.Vector3(b[0], -.5, b[1]));
  }
  for (let lat = 20; lat <= 49; lat += 2) {
    const a = project(118, lat), b = project(154, lat);
    grid.push(new THREE.Vector3(a[0], -.5, a[1]), new THREE.Vector3(b[0], -.5, b[1]));
  }
  world.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(grid), new THREE.LineBasicMaterial({ color: 0x608a93, transparent: true, opacity: .10 })));

  const routeCurves = points.slice(1).map((end, i) => {
    const start = points[i];
    const middle = start.clone().lerp(end, .5); middle.y = Math.min(32, start.distanceTo(end) * .1 + 4);
    return new THREE.QuadraticBezierCurve3(start.clone().setY(1), middle, end.clone().setY(1));
  });
  const routeLines = routeCurves.map((curve) => {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)), new THREE.LineBasicMaterial({ color: 0xcbb98e, transparent: true, opacity: .22 }));
    world.add(line); return line;
  });
  const liveRoute = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xf0d4a0, transparent: true, opacity: .95 })); world.add(liveRoute);
  const craft = new THREE.Mesh(new THREE.SphereGeometry(.7, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffebbf })); world.add(craft);

  // Labels are real world sprites, so perspective changes their size and position.
  function textSprite(title: string, subtitle = "", width = 18) {
    const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.textAlign = "center"; ctx.fillStyle = "#f1ebdc"; ctx.font = "400 74px Georgia";
    ctx.shadowColor = "#071017"; ctx.shadowBlur = 12; ctx.fillText(title, 512, 112);
    ctx.shadowBlur = 0; ctx.fillStyle = "#bbbea9"; ctx.font = "24px sans-serif"; ctx.fillText(subtitle, 512, 177);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; ownedTextures.add(texture);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, fog: false }));
    sprite.scale.set(width, width / 4, 1); return sprite;
  }
  const labels = points.map((point, i) => {
    const marker = new THREE.Mesh(new THREE.RingGeometry(.55, .85, 32), new THREE.MeshBasicMaterial({ color: 0xe2c997, side: THREE.DoubleSide }));
    marker.rotation.x = -Math.PI / 2; marker.position.copy(point).setY(.65); world.add(marker);
    const sprite = textSprite(stops[i].english, stops[i].anchor, compact ? 19 : 17);
    sprite.position.copy(point).add(new THREE.Vector3(0, 3, -3)); world.add(sprite); return sprite;
  });
  // Oarai has its own geographic marker; the journey camera anchors at Mito.
  const oaraiPoint = project(140.575, 36.3134);
  const oarai = textSprite("OARAI", "大洗", 6); oarai.position.set(oaraiPoint[0], 1, oaraiPoint[1] + 2); world.add(oarai);
  const sea = textSprite("PACIFIC OCEAN", "太平洋", 66); sea.position.set(110, 0, 105); sea.material.opacity = .22; world.add(sea);

  const photoGeometry = new THREE.PlaneGeometry(16, 10);
  const portals = photoCenters.map((center, i) => {
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, fog: false });
    const mesh = new THREE.Mesh(photoGeometry, material); mesh.position.copy(center); mesh.quaternion.copy(neutralRotation); mesh.visible = false; world.add(mesh);
    const title = textSprite(stops[i].english, stops[i].number, 12);
    title.position.copy(center).add(new THREE.Vector3(0, 4, 0)); title.visible = false; world.add(title);
    return { mesh, material, title, key: "", texture: null as THREE.Texture | null, controller: null as AbortController | null };
  });
  function placeholder(index: number) {
    const canvas = document.createElement("canvas"); canvas.width = 1024; canvas.height = 640;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 1024, 640); gradient.addColorStop(0, "#314843"); gradient.addColorStop(1, "#0d1a20"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 640);
    ctx.fillStyle = "#c3b695"; ctx.textAlign = "center"; ctx.font = "40px Georgia"; ctx.fillText(stops[index].english, 512, 308);
    ctx.font = "18px sans-serif"; ctx.fillText("写真を追加すると、この景色へ", 512, 364);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }
  function setTexture(index: number, texture: THREE.Texture) {
    const portal = portals[index]; portal.texture?.dispose(); portal.texture = texture; portal.material.map = texture; portal.material.needsUpdate = true; schedule();
  }
  function syncTextures(index: number) {
    const records = options.getStops();
    portals.forEach((portal, i) => {
      if (i === 0) return;
      if (Math.abs(i - index) > 1) {
        portal.controller?.abort(); portal.controller = null; portal.texture?.dispose(); portal.texture = null; portal.material.map = null; portal.key = ""; return;
      }
      const source = records[i].image ?? "";
      if (portal.key === source && portal.texture) return;
      portal.controller?.abort(); portal.key = source; setTexture(i, placeholder(i));
      if (!source) return;
      const controller = new AbortController(); portal.controller = controller;
      let url = source.startsWith("/") ? `${basePath}${source}` : source;
      if (url.includes("images.unsplash.com")) { const u = new URL(url); u.searchParams.set("w", compact ? "1024" : "1600"); u.searchParams.set("q", "82"); url = u.toString(); }
      fetch(url, { signal: controller.signal }).then((r) => { if (!r.ok) throw Error("Photo unavailable"); return r.blob(); }).then(async (blob) => {
        const bitmap = await createImageBitmap(blob);
        if (dead || controller.signal.aborted) { bitmap.close(); return; }
        const canvas = document.createElement("canvas"); canvas.width = compact ? 1024 : 1600; canvas.height = canvas.width / 1.6;
        const ctx = canvas.getContext("2d")!; const scale = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
        ctx.drawImage(bitmap, (canvas.width - bitmap.width * scale) / 2, (canvas.height - bitmap.height * scale) / 2, bitmap.width * scale, bitmap.height * scale); bitmap.close();
        const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 2; setTexture(i, texture);
      }).catch(() => { /* A failed photo retains the labeled placeholder. */ });
    });
  }

  let lastLeg = -1, lastPercent = -1;
  const lookMatrix = new THREE.Matrix4();
  const mapUp = new THREE.Vector3(0, 1, 0);
  function pose(position: THREE.Vector3, focus: THREE.Vector3) {
    lookMatrix.lookAt(position, focus, mapUp);
    return { position, rotation: new THREE.Quaternion().setFromRotationMatrix(lookMatrix) };
  }
  function sampleCamera(leg: number, local: number) {
    const start = points[leg], end = points[leg + 1], center = photoCenters[leg + 1];
    const spread = Math.max(38, Math.min(200, start.distanceTo(end) * .66));
    const mobileFactor = compact ? 1.35 : 1;
    const altitude = spread * mobileFactor;
    const eyeAt = (p: THREE.Vector3, distance: number) => p.clone().addScaledVector(normal, distance);
    const flyFocus = start.clone().lerp(end, .46);
    const bank = new THREE.Vector3(-(end.z - start.z), 0, end.x - start.x).normalize().multiplyScalar(Math.min(18, spread * .1));
    const previousExit = pose(eyeAt(photoCenters[leg], -3), eyeAt(photoCenters[leg], -13));
    const overviewFocus = new THREE.Vector3(-35, 0, 60);
    const overviewDistance = Math.max(750, 550 / (2 * Math.tan(THREE.MathUtils.degToRad(43 / 2)) * camera.aspect)) * 1.08;
    const initial = pose(eyeAt(overviewFocus, overviewDistance), overviewFocus);
    const photoDistance = Math.min(10 / (2 * Math.tan(THREE.MathUtils.degToRad(43 / 2))), 16 / (2 * Math.tan(THREE.MathUtils.degToRad(43 / 2)) * camera.aspect));
    const keys = [
      { at: 0, ...(leg === 0 ? initial : previousExit) },
      { at: .16, ...pose(eyeAt(start, altitude), start) },
      { at: .44, ...pose(eyeAt(flyFocus, altitude * 1.35).add(bank), flyFocus) },
      { at: .64, ...pose(eyeAt(end, altitude * .8), end) },
      { at: .80, ...pose(eyeAt(center, photoDistance), center) },
      { at: .95, ...pose(eyeAt(center, photoDistance * .70), center) },
      { at: 1, ...pose(eyeAt(center, -3), eyeAt(center, -13)) },
    ];
    const upper = keys.findIndex((key) => key.at >= local);
    const a = keys[Math.max(0, upper - 1)], b = keys[Math.max(0, upper)];
    const t = b.at === a.at ? 0 : ease((local - a.at) / (b.at - a.at));
    camera.position.copy(a.position).lerp(b.position, t); camera.quaternion.copy(a.rotation).slerp(b.rotation, t);
  }
  function draw(time: number) {
    frame = 0;
    if (dead || !active || document.hidden) return;
    const delta = Math.min(.06, (time - previousTime) / 1000 || .016); previousTime = time;
    current += (target - current) * (1 - Math.exp(-delta * 7));
    if (Math.abs(target - current) < .00001) current = target;
    const state = flightState(current, stops.length - 1), { leg, local } = state;
    sampleCamera(leg, local);
    if (lastLeg !== leg) {
      liveRoute.geometry.dispose(); liveRoute.geometry = new THREE.BufferGeometry().setFromPoints(routeCurves[leg].getPoints(100)); lastLeg = leg;
    }
    syncTextures(leg + 1);
    liveRoute.geometry.setDrawRange(0, Math.max(2, Math.floor(ease((local - .16) / .5) * 101)));
    routeLines.forEach((line, i) => { line.material.opacity = i < leg ? .68 : .34; });
    craft.position.copy(routeCurves[leg].getPoint(ease((local - .16) / .5)));
    const photoPhase = local > .70;
    labels.forEach((label, i) => {
      label.visible = !photoPhase;
      const width = Math.max(compact ? 19 : 17, camera.position.distanceTo(points[i]) * .043);
      label.scale.set(width, width / 4, 1);
    });
    portals.forEach((portal, i) => { portal.mesh.visible = i > 0 && ((i === leg + 1 && local > .38) || (i === leg && local < .16)); portal.title.visible = i === leg + 1 && local > .48 && local < .79; });
    oarai.visible = leg === 7 || leg === 8;
    // Keep the archipelago visible when a narrow screen needs a higher overview.
    fog.near = Math.max(360, camera.position.length() * .85);
    fog.far = fog.near + 1400;
    world.fog = photoPhase ? null : fog;
    const percent = Math.round(current * 1000);
    if (lastPercent !== percent) { options.onFrame(current, state); lastPercent = percent; }
    renderer.render(world, camera);
    if (current !== target) schedule();
  }
  const fog = world.fog;
  function schedule() { if (!dead && active && !frame && !document.hidden) frame = requestAnimationFrame(draw); }
  function updateTarget() {
    target = clamp(-host.getBoundingClientRect().top / Math.max(1, host.offsetHeight - canvasHost.clientHeight)); schedule();
  }
  function resize() {
    renderer.setSize(canvasHost.clientWidth, canvasHost.clientHeight, false); camera.aspect = canvasHost.clientWidth / Math.max(1, canvasHost.clientHeight); camera.updateProjectionMatrix(); updateTarget();
  }
  function contextLost(event: Event) { event.preventDefault(); options.onError(); }
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; previousTime = performance.now(); if (active) { updateTarget(); schedule(); } else if (frame) { cancelAnimationFrame(frame); frame = 0; } }); observer.observe(host);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvasHost);
  window.addEventListener("scroll", updateTarget, { passive: true }); document.addEventListener("visibilitychange", schedule);
  resize();

  // Expose cleanup before the asynchronous geographic data returns.
  fetch(`${basePath}/maps/japan-context.geojson`, { signal: abort.signal }).then((r) => { if (!r.ok) throw Error("Map unavailable"); return r.json() as Promise<Land>; }).then((land) => {
    if (dead) return;
    land.features.forEach((feature) => {
      const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates as number[][][]] : feature.geometry.coordinates as number[][][][];
      polygons.forEach((rings) => {
        const shapes = rings.map((ring) => new THREE.Shape(ring.map(([lon, lat]) => { const [x, z] = project(lon, lat); return new THREE.Vector2(x, -z); })));
        if (!shapes[0]) return; shapes[0].holes = shapes.slice(1);
        const geometry = new THREE.ExtrudeGeometry(shapes[0], { depth: .45, bevelEnabled: false, steps: 1, curveSegments: 1 });
        geometry.rotateX(-Math.PI / 2);
        world.add(new THREE.Mesh(geometry, feature.properties.name === "Japan" ? colorLand : neighborLand));
        if (feature.properties.name === "Japan") rings.forEach((ring) => {
          const vertices = ring.map(([lon, lat]) => { const [x, z] = project(lon, lat); return new THREE.Vector3(x, .48, z); });
          world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices), shoreMaterial));
        });
      });
    });
    options.onReady(); schedule();
  }).catch(() => { if (!dead) options.onError(); });

  return {
    refresh: schedule,
    dispose() {
      dead = true; abort.abort(); observer.disconnect(); resizeObserver.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateTarget); document.removeEventListener("visibilitychange", schedule); renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      portals.forEach((p) => { p.controller?.abort(); p.texture?.dispose(); }); ownedTextures.forEach((t) => t.dispose());
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      world.traverse((o) => { if (o instanceof THREE.Mesh || o instanceof THREE.Line || o instanceof THREE.Sprite) { if ("geometry" in o) geometries.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => materials.add(m)); } });
      geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); renderer.dispose(); renderer.domElement.remove();
    },
  };
}

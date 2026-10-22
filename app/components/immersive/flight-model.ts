export type FlightMode = "flight" | "atlas";
export type FlightStop = { slug: string; longitude: number; latitude: number };
export type CameraPose = { center: [number, number]; zoom: number; pitch: number; bearing: number };
export const prototypeSlugs = ["tokyo", "mito-oarai", "nagano"] as const;
export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp01(n); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function arrivalProgress(index: number, count: number) {
  return index === 0 ? 0 : (index - 1 + .90) / Math.max(1, count - 1);
}

/** Pure, reversible camera choreography. Coordinates are places, not transport tracks. */
export function sampleFlight(progress: number, stops: FlightStop[]) {
  const value = clamp01(progress) * (stops.length - 1);
  const leg = Math.min(stops.length - 2, Math.floor(value));
  const local = value - leg;
  const a = stops[leg], b = stops[leg + 1];
  const start: [number, number] = [a.longitude, a.latitude];
  const end: [number, number] = [b.longitude, b.latitude];
  const endBearing = leg === 0 ? -12 : -35;
  const departBearing = leg === 0 ? 20 : -12;
  const heading = Math.atan2(end[0] - start[0], end[1] - start[1]) * 180 / Math.PI;
  const keys = [
    { t: 0, center: [start[0], start[1] + (leg ? .003 : 0)], zoom: leg ? 14.6 : 10.7, pitch: leg ? 68 : 58, bearing: departBearing },
    { t: .19, center: start, zoom: 9.8, pitch: 62, bearing: heading },
    { t: .44, center: [mix(start[0], end[0], .45), mix(start[1], end[1], .45) + .12], zoom: 10, pitch: 68, bearing: heading },
    { t: .66, center: [mix(start[0], end[0], .90), mix(start[1], end[1], .90)], zoom: 11.3, pitch: 70, bearing: endBearing - 15 },
    { t: .81, center: end, zoom: 13.3, pitch: 66, bearing: endBearing },
    { t: .94, center: end, zoom: 14.4, pitch: 64, bearing: endBearing },
    { t: 1, center: [end[0], end[1] + .003], zoom: 14.6, pitch: 68, bearing: endBearing },
  ];
  const upper = Math.max(1, keys.findIndex(k => k.t >= local));
  const left = keys[upper - 1], right = keys[upper];
  const t = smooth((local - left.t) / (right.t - left.t));
  const pose: CameraPose = {
    center: [mix(left.center[0], right.center[0], t), mix(left.center[1], right.center[1], t)],
    zoom: mix(left.zoom, right.zoom, t), pitch: mix(left.pitch, right.pitch, t), bearing: mix(left.bearing, right.bearing, t),
  };
  const phase = local < .19 ? "DEPARTURE" : local < .66 ? "IN FLIGHT" : local < .81 ? "APPROACH" : local < .96 ? "MEMORY PORTAL" : "ONWARD";
  return { pose, leg, local, phase, progress: clamp01(progress), portal: smooth((local - .71) / .13) * (1 - smooth((local - .96) / .04)) };
}

export function dampProgress(current: number, target: number, seconds: number) {
  const result = current + (clamp01(target) - current) * (1 - Math.exp(-Math.min(.06, Math.max(0, seconds)) * 5));
  return Math.abs(target - result) < .00001 ? clamp01(target) : result;
}

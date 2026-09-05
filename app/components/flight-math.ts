// The same Mercator projection is used for the shoreline and the camera stops.
export const clamp = (n: number) => Math.min(1, Math.max(0, n));
export const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;
export function project(longitude: number, latitude: number): [number, number] {
  return [(longitude - 137) * 20, -(mercator(latitude) - mercator(36)) * 20];
}
export function flightState(progress: number, legs: number) {
  const t = clamp(progress) * legs;
  const leg = Math.min(legs - 1, Math.floor(t));
  const local = t - leg;
  const phase = local < .16 ? "DEPARTURE" : local < .59 ? "TRAVEL" : local < .80 ? "APPROACH" : local < .96 ? "ARRIVAL" : "PASSAGE";
  return { leg, local, phase };
}
export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad, dLon = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

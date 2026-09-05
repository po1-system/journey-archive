import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { project, distanceKm, flightState } from "../app/components/flight-math.ts";

test("projection keeps north up and Okinawa southwest without an inset", () => {
  const tokyo = project(139.7671, 35.6812), naha = project(127.6792, 26.2124), hakodate = project(140.7288, 41.7687);
  assert.ok(naha[0] < tokyo[0] && naha[1] > tokyo[1]);
  assert.ok(hakodate[0] > tokyo[0] && hakodate[1] < tokyo[1]);
  assert.equal(project(137, 36)[0], 0);
});

test("geographic anchors lie on the Japan shoreline source", () => {
  const data = JSON.parse(readFileSync(new URL("../public/maps/japan-context.geojson", import.meta.url)));
  const japan = data.features.find((f) => f.properties.name === "Japan");
  function inside([x, y], ring) {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }
  for (const point of [[139.7671, 35.6812], [127.6792, 26.2124], [138.181, 36.6513], [132.4553, 34.3853]]) {
    assert.ok(japan.geometry.coordinates.some(([ring]) => inside(point, ring)), `${point} is on Japan, not a shifted SVG inset`);
  }
});

test("distance is a symmetric geographic distance, not arbitrary progress", () => {
  const tokyo = {longitude:139.7671,latitude:35.6812}, takamatsu = {longitude:134.0466,latitude:34.3428};
  assert.equal(distanceKm(tokyo, tokyo), 0);
  assert.equal(distanceKm(tokyo, takamatsu), distanceKm(takamatsu, tokyo));
  assert.ok(distanceKm(tokyo, takamatsu) > 530 && distanceKm(tokyo, takamatsu) < 555);
});

test("forward and reverse travel cover each arrival and both endpoints", () => {
  const forward = Array.from({length:9}, (_,i) => flightState((i + .86) / 9, 9));
  assert.deepEqual(forward.map((s) => s.leg), [0,1,2,3,4,5,6,7,8]);
  assert.ok(forward.every((s) => s.phase === "ARRIVAL"));
  const reverse = Array.from({length:9}, (_,i) => flightState((8 - i + .86) / 9, 9));
  assert.deepEqual(reverse.map((s) => s.leg), [8,7,6,5,4,3,2,1,0]);
  assert.equal(flightState(-1, 9).leg, 0);
  assert.deepEqual(flightState(2, 9), {leg:8,local:1,phase:"PASSAGE"});
});

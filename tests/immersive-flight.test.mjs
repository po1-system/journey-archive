import test from "node:test";
import assert from "node:assert/strict";
import { sampleFlight, arrivalProgress, dampProgress, prototypeSlugs } from "../app/components/immersive/flight-model.ts";

const stops = [
  { slug: "tokyo", longitude: 139.7671, latitude: 35.6812 },
  { slug: "mito-oarai", longitude: 140.4712, latitude: 36.3659 },
  { slug: "nagano", longitude: 138.181, latitude: 36.6513 },
];

test("prototype is Tokyo → Mito/Oarai → Nagano; arrival buttons enter each portal", () => {
  assert.deepEqual(prototypeSlugs, stops.map(s => s.slug));
  assert.deepEqual(sampleFlight(0, stops).pose.center, [stops[0].longitude, stops[0].latitude]);
  for (let i = 1; i < stops.length; i++) {
    const state = sampleFlight(arrivalProgress(i, stops.length), stops);
    assert.equal(state.leg, i - 1);
    assert.equal(state.phase, "MEMORY PORTAL");
    assert.equal(state.portal, 1);
    assert.deepEqual(state.pose.center, [stops[i].longitude, stops[i].latitude]);
  }
});

test("Mito departure joins its arrival continuously, including zoom, pitch and bearing", () => {
  const before = sampleFlight(.5 - 1e-8, stops).pose;
  const after = sampleFlight(.5, stops).pose;
  for (const key of ["zoom", "pitch", "bearing"]) assert.ok(Math.abs(before[key] - after[key]) < .00001);
  assert.ok(Math.hypot(before.center[0] - after.center[0], before.center[1] - after.center[1]) < .00001);
});

test("reverse scrolling retraces identical camera positions without accumulated state", () => {
  const positions = Array.from({length:1001}, (_, i) => i / 1000);
  const forwards = positions.map(p => sampleFlight(p, stops));
  const backwards = positions.toReversed().map(p => sampleFlight(p, stops)).reverse();
  assert.deepEqual(forwards, backwards);
  for (const state of forwards) {
    assert.ok(state.pose.center.every(Number.isFinite));
    assert.ok(state.pose.zoom >= 9.8 && state.pose.zoom <= 14.6);
    assert.ok(state.pose.pitch >= 58 && state.pose.pitch <= 70);
    assert.ok(state.portal >= 0 && state.portal <= 1);
  }
  assert.equal(sampleFlight(-3, stops).progress, 0);
  assert.equal(sampleFlight(3, stops).progress, 1);
});

test("inertia decelerates, settles and reverses without overshooting", () => {
  let progress = 0;
  for (let i=0; i<200; i++) {
    const next = dampProgress(progress, .9, 1/60);
    assert.ok(next >= progress && next <= .9); progress = next;
  }
  assert.equal(progress, .9);
  for (let i=0; i<200; i++) {
    const next = dampProgress(progress, .1, 1/60);
    assert.ok(next <= progress && next >= .1); progress = next;
  }
  assert.equal(progress, .1);
});

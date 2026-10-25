import test from "node:test";
import assert from "node:assert/strict";
import { createExpression, validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { mapStyle } from "../app/components/immersive/map-style.ts";

test("wide-area imagery excludes the defective world mosaic tiles", () => {
  const style = mapStyle();
  assert.deepEqual(validateStyleMin(style), []);
  assert.match(style.sources.overview.tiles[0], /gibs\.earthdata\.nasa\.gov\/.*BlueMarble_ShadedRelief_Bathymetry/);
  assert.ok(style.sources.overview.tiles[0].endsWith("/{z}/{y}/{x}.jpeg"));
  assert.equal(style.sources.overview.minzoom, 0);
  assert.equal(style.sources.overview.maxzoom, 8);
  // seamlessphoto 2–8 contains the grey wedge in the original source image.
  assert.equal(style.sources.aerial.minzoom, 9);
  assert.ok(style.layers.find(layer => layer.id === "aerial").minzoom >= 9);
  assert.match(style.sources.overview.attribution, /NASA GIBS \/ ESDIS/);
  assert.match(style.sources.aerial.attribution, /国土地理院/);
  assert.match(style.sources.aerial.attribution, /GEO Grid\/AIST/);
  assert.match(style.sources.aerial.attribution, /GEBCO/);
});

test("zoom blends into aerial imagery over an opaque overview without changing terrain", () => {
  const style = mapStyle();
  assert.deepEqual(style.terrain, { source: "elevation", exaggeration: 1.25 });
  assert.equal(style.sources.elevation.encoding, "terrarium");
  const overview = style.layers.find(layer => layer.id === "overview");
  const aerial = style.layers.find(layer => layer.id === "aerial");
  assert.ok(style.layers.indexOf(overview) < style.layers.indexOf(aerial));
  assert.equal(overview.paint["raster-opacity"], 1);
  const opacity = createExpression(aerial.paint["raster-opacity"], `layers[${style.layers.indexOf(aerial)}].paint.raster-opacity`);
  assert.equal(opacity.result, "success");
  const sample = zoom => opacity.value.evaluate({ zoom });
  assert.equal(sample(8), 0);
  assert.equal(sample(9), 0);
  assert.ok(sample(10) > 0 && sample(10) < 1);
  assert.equal(sample(10.5), 1);
  assert.equal(sample(14.6), 1);
  assert.ok(Math.abs(sample(10.001) - sample(10)) < .001);
});

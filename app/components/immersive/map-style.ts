import type { StyleSpecification } from "maplibre-gl";

export const terrainAttribution = 'Terrain: <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Mapzen / AWS Open Data</a> · USGS SRTM/GMTED2010 · NOAA ETOPO1';
export const imageryAttribution = '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a> · Landsat8 (GSI, TSIC, GEO Grid/AIST, USGS) · GEBCO · NASA/USGS LP DAAC';

export function mapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      aerial: { type: "raster", tiles: ["https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"], tileSize: 256, minzoom: 2, maxzoom: 17, attribution: imageryAttribution },
      elevation: { type: "raster-dem", tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"], tileSize: 256, encoding: "terrarium", maxzoom: 14, attribution: terrainAttribution },
    },
    layers: [
      { id: "sea", type: "background", paint: { "background-color": "#132a32" } },
      { id: "aerial", type: "raster", source: "aerial", paint: { "raster-saturation": -.15, "raster-contrast": .08, "raster-brightness-max": .88, "raster-fade-duration": 350 } },
    ],
    terrain: { source: "elevation", exaggeration: 1.25 },
    sky: { "sky-color": "#79979d", "horizon-color": "#ece2cb", "fog-color": "#c9d6d1", "fog-ground-blend": .75, "horizon-fog-blend": .65, "sky-horizon-blend": .6, "atmosphere-blend": .25 },
  };
}

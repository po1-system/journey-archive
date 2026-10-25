import type { StyleSpecification } from "maplibre-gl";

export const terrainAttribution = 'Terrain: <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Mapzen / AWS Open Data</a> · USGS SRTM/GMTED2010 · NOAA ETOPO1';
export const overviewAttribution = '<a href="https://nasa-gibs.github.io/gibs-api-docs/" target="_blank" rel="noopener">NASA GIBS / ESDIS</a> · Blue Marble';
export const imageryAttribution = '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a> · データソース：Landsat8画像 (GSI, TSIC, GEO Grid/AIST), Landsat8画像 (courtesy of the U.S. Geological Survey), 海底地形 (GEBCO)';

export function mapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      // seamlessphoto z2–8 uses a world mosaic with a visible no-data wedge.
      // NASA Blue Marble covers Japan AND the surrounding land/sea continuously.
      // WMTS uses z/y/x (not GSI's z/x/y); zoom 8 is its native maximum.
      overview: { type: "raster", tiles: ["https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg"], tileSize: 256, minzoom: 0, maxzoom: 8, attribution: overviewAttribution },
      aerial: { type: "raster", tiles: ["https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"], tileSize: 256, minzoom: 9, maxzoom: 17, attribution: `${imageryAttribution} · GRUS画像 (© Axelspace)` },
      elevation: { type: "raster-dem", tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"], tileSize: 256, encoding: "terrarium", maxzoom: 14, attribution: terrainAttribution },
    },
    layers: [
      { id: "sea", type: "background", paint: { "background-color": "#132a32" } },
      // Leave an opaque base under the blend: fading both layers would expose
      // the background midway. Stop fetching overview tiles once fully covered.
      { id: "overview", type: "raster", source: "overview", maxzoom: 11, paint: { "raster-opacity": 1, "raster-saturation": -.15, "raster-contrast": .08, "raster-brightness-max": .88, "raster-fade-duration": 350 } },
      { id: "aerial", type: "raster", source: "aerial", minzoom: 9, paint: { "raster-opacity": ["interpolate", ["linear"], ["zoom"], 9, 0, 10.5, 1], "raster-saturation": -.15, "raster-contrast": .08, "raster-brightness-max": .88, "raster-fade-duration": 350 } },
    ],
    terrain: { source: "elevation", exaggeration: 1.25 },
    sky: { "sky-color": "#79979d", "horizon-color": "#ece2cb", "fog-color": "#c9d6d1", "fog-ground-blend": .75, "horizon-fog-blend": .65, "sky-horizon-blend": .6, "atmosphere-blend": .25 },
  };
}

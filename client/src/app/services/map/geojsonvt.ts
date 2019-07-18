import Projection from 'ol/proj/Projection';
import geojsonVt from 'geojson-vt';
import GeoJSON from 'ol/format/GeoJSON';
import VectorTileSource from 'ol/source/VectorTile';

export function GeoJsonVectorTileSource(data, options = {}) {
  const featureToGeoJSON = vtFeature => {
    const types = {
      1: 'MultiPoint',
      2: 'MultiLineString',
      3: 'MultiPolygon',
    };

    return {
      id: vtFeature.id,
      type: 'Feature',
      geometry: {
        type: types[vtFeature.type],
        coordinates: vtFeature.type === 3 ? [vtFeature.geometry] : vtFeature.geometry
      },
      properties: vtFeature.tags,
    };
  };

  const tilePixels = new Projection({
    code: 'TILE_PIXELS',
    units: 'tile-pixels',
  });

  const state = {
    tileIndex: geojsonVt(data, {
      extent: 4096,
      maxZoom: 18,
      tolerance: 3,
      ...options,
    }),
  };

  return new VectorTileSource({
    format: new GeoJSON(),
    tileUrlFunction: () => 'data',
    tileLoadFunction: (tile: any, url) => {
      console.log('loading tile');
      const tileCoord = tile.getTileCoord();
      const vectorTiles = state.tileIndex.getTile(tileCoord[0], tileCoord[1], -tileCoord[2] - 1);

      const features = tile.getFormat().readFeatures({
        type: 'FeatureCollection',
        features: vectorTiles ? vectorTiles.features.map(featureToGeoJSON) : []
      });

      tile.setLoader(() => {
        console.log('set loader');
        tile.setFeatures(features);
        tile.setProjection(tilePixels);
      });
    }
  });
}

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import * as fs from 'fs';
import axios from 'axios';
import * as GeoTiff from 'geotiff';
import { MultiPromise } from '../libraries/multi-promise';
import { MapService } from './map.service';
import { MapFeatureType } from '../entity/map-data.entity';
import bbox from '@turf/bbox';
import { lengthToDegrees } from '@turf/helpers';

const TIFF_WIDTH = 2048;
const TIFF_HEIGHT = 2048;
const LOCATION_BIAS = lengthToDegrees(300, 'meters');

/**
 * Provides altitude data from NASA shuttle radar topography mission
 * The tiles are downloaded from webservice-energy.org's API
 * The tiles are cached on download and are later read and parsed
 * as GeoTIFF files.
 */
@Injectable()
export class SRTMService {
  private mapReadyWaiter: Promise<any> = null;

  constructor(
    @Inject(forwardRef(() => MapService))
    private mapService: MapService,
  ) {}

  public getAltitudeForPoint(latitude: number, longitude: number) {
    return this.getAltitude([
      longitude - LOCATION_BIAS, // left
      latitude - LOCATION_BIAS, // bottom
      longitude + LOCATION_BIAS, // right
      latitude + LOCATION_BIAS, // top
    ]);
  }

  /**
   * Get the altitude for a given coordinate
   * @param point [minX, minY, maxX, maxY] or [lng0, lat0, lng1, lat1] or [left, bottom, right, top]
   * @param bounds [minX, minY, maxX, maxY] or [lng0, lat0, lng1, lat1] or [left, bottom, right, top]
   */
  public async getAltitude(
    area,
  ): Promise<{
    averageAltitude: number;
    variance: number;
  }> {
    const map = await this.download();

    const [oX, oY] = map.getOrigin();
    const [imageResX, imageResY] = map.getResolution();

    let window = [
      Math.round((area[0] - oX) / imageResX),
      Math.round((area[1] - oY) / imageResY),
      Math.round((area[2] - oX) / imageResX),
      Math.round((area[3] - oY) / imageResY),
    ];
    window = [
      Math.min(window[0], window[2]), // left
      Math.min(window[1], window[3]), // top
      Math.max(window[0], window[2]), // right
      Math.max(window[1], window[3]), // bottom
    ];

    const rasters = await map.readRasters({
      window,
    });

    const averageAltitude =
      rasters[0].reduce((sum, altitude) => sum + altitude, 0) /
      (rasters.width * rasters.height);

    const minAltitude = rasters[0].reduce(
      (min, altitude) => (altitude < min ? altitude : min),
      Infinity,
    );
    const maxAltitude = rasters[0].reduce(
      (max, altitude) => (altitude > max ? altitude : max),
      -Infinity,
    );

    const variance = maxAltitude - minAltitude;

    return {
      averageAltitude,
      variance,
    };
  }

  /**
   * Downloads and caches an srtm tile for the given bounds
   * @param bounds The bounds
   */
  private async download(): Promise<any> {
    if (this.mapReadyWaiter) {
      return this.mapReadyWaiter;
    }

    const reserve = await this.mapService.getMapFeature(MapFeatureType.reserve);
    const bounds = bbox(reserve);

    this.mapReadyWaiter = new Promise(async (resolve, reject) => {
      const cacheDir = this.getCacheDir(bounds);
      const cacheHit = await new Promise(resolve => fs.exists(cacheDir, resolve));
      
      if (!cacheHit) {
        const mapData = await axios.get(this.buildUrl(bounds), {
          responseType: 'arraybuffer',
        });

        await new Promise(resolve => fs.writeFile(cacheDir, mapData.data, resolve));
      }

      const tiff = await GeoTiff.fromFile(cacheDir);
      resolve(tiff.getImage());
    });

    return this.mapReadyWaiter;
  }

  /**
   * Gets the name of the file which stores the tile cache
   * for given bounds
   * @param bounds The bounds
   */
  private getCacheDir(bounds): string {
    return `.map-cache/srtm-${bounds.join(',')}.tif`;
  }

  /**
   * Constructs a url to download an srtm tile
   * @param bounds The bounds of the tile
   */
  private buildUrl(bounds): string {
    const url = `http://www.webservice-energy.org/mapserv/srtm?layers=srtm_s0&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Ftiff&SRS=EPSG:4326&BBOX=${bounds.join(
      ',',
    )}&width=${TIFF_WIDTH}&height=${TIFF_HEIGHT}`;
    console.log(url);
    return url;
  }
}

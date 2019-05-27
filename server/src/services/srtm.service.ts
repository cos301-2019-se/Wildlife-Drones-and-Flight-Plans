import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import axios from 'axios';
import * as GeoTiff from 'geotiff';
import { MultiPromise } from '../libraries/multi-promise';
import * as computeVariance from 'compute-variance';

const TIFF_WIDTH = 2048;
const TIFF_HEIGHT = 2048;

/**
 * Provides altitude data from NASA shuttle radar topography mission
 */
@Injectable()
export class SRTMService {

  private mapReadyWaiter: MultiPromise = null;

  /**
   * Get the altitude for a given coordinate
   * @param point [minX, minY, maxX, maxY] or [lng0, lat0, lng1, lat1] or [left, bottom, right, top]
   * @param bounds [minX, minY, maxX, maxY] or [lng0, lat0, lng1, lat1] or [left, bottom, right, top]
   */
  public async getAltitude(area, bounds): Promise<{
    averageAltitude: number,
    variance: number,
  }> {
    const map = await this.download(bounds);

    const [oX, oY] = map.getOrigin();
    const [imageResX, imageResY] = map.getResolution();

    let window = [
      Math.round((area[0] - oX) / imageResX),
      Math.round((area[1] - oY) / imageResY),
      Math.round((area[2] - oX) / imageResX),
      Math.round((area[3] - oY) / imageResY),
    ];
    window = [
      Math.min(window[0], window[2]),
      Math.min(window[1], window[3]),
      Math.max(window[0], window[2]),
      Math.max(window[1], window[3]),
    ];

    const rasters = await map.readRasters({
      window,
    });

    const averageAltitude = rasters[0].reduce((sum, altitude) => sum + altitude, 0) / (rasters.width * rasters.height);
    const variance = computeVariance(rasters[0]);

    return {
      averageAltitude,
      variance,
    };
  }

  private async download(bounds): Promise<any> {
    const cacheDir = this.getCacheDir(bounds);
    if (this.mapReadyWaiter === null) {
      this.mapReadyWaiter = new MultiPromise(async () => {
        if (!fs.existsSync(cacheDir)) {
          const mapData = await axios.get(this.buildUrl(bounds), {
            responseType: 'arraybuffer',
          });

          fs.writeFileSync(cacheDir, mapData.data);
        }

        const tiff = await GeoTiff.fromFile(cacheDir);
        return await tiff.getImage();
      });
    }

    return await this.mapReadyWaiter.ready();
  }

  private getCacheDir(bounds): string {
    return `.map-cache/srtm-${bounds.join(',')}.tif`;
  }

  private buildUrl(bounds): string {
    const url = `http://www.webservice-energy.org/mapserv/srtm?layers=srtm_s0&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Ftiff&SRS=EPSG:4326&BBOX=${bounds.join(',')}&width=${TIFF_WIDTH}&height=${TIFF_HEIGHT}`;
    console.log(url);
    return url;
  }
}

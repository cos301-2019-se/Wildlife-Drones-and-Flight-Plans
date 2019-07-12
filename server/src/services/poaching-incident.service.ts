import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { PoachingIncident } from '../entity/poaching-incident.entity';
import { PoachingIncidentType } from '../entity/poaching-incident-type.entity';
import { ReserveConfiguration } from '../entity/reserve-configuration.entity';
import { MapUpdaterService } from './map-updater.service';
import bbox from '@turf/bbox';
import { GeoService, GeoSearchSet } from './geo.service';
import { SRTMService } from './srtm.service';
import { lengthToDegrees } from '@turf/helpers';


const LOCATION_BIAS = lengthToDegrees(300, 'meters');
@Injectable()
export class PoachingIncidentService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mapUpdater: MapUpdaterService,
    private readonly geo: GeoService,
    private readonly altitude: SRTMService,
  ) {}  

  async addPoachingIncident(
    lon: number,
    lat: number,
    pType: string,
    description: string,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    //const poachingIncident = new PoachingIncident();

    const reserve = await con.getRepository(ReserveConfiguration).findOne({});

    console.log(reserve.reserveName);

    const mapData = await this.mapUpdater.getMapFeatures(
      reserve.reserveName,
    );

    const bounds = bbox(mapData.reserve);
    console.time('feature searchers');
    const featureSearchers: { [s: string]: GeoSearchSet } = Object.keys(
      mapData.features,
    ).reduce((searchers, featureName) => {
      searchers[featureName] = this.geo.createFastSearchDataset(
        mapData.features[featureName],
      );
      return searchers;
    }, {});
    console.timeEnd('feature searchers');

    console.timeEnd('get map data');

    // if not parse then it gives not a number
    const latitude = parseFloat(lat.toString());
    const longitude = parseFloat(lon.toString());
    const locationBounds = [
      longitude - LOCATION_BIAS, // left
      latitude - LOCATION_BIAS, // bottom
      longitude + LOCATION_BIAS, // right
      latitude + LOCATION_BIAS, // top
    ];

    const altitudeInfo = await this.altitude.getAltitude(
      locationBounds,
      bounds,
    );

    try {
      const poachingIncidentType = await con
        .getRepository(PoachingIncidentType)
        .findOne({ type: pType });

      if (poachingIncidentType == undefined) {
        console.log('The type of incident does not exist.');
        return false;
      } else {
        const date = new Date();

        const poachingIncident: PoachingIncident = {
          timestamp : date,
          longitude: lon,
         latitude: lat,
          description: description,
          type: poachingIncidentType,
          month: date.getMonth() + 1,
          time: date.getHours() * 60 + date.getMinutes(),
          CoordinateData: "distanceToDams: " + featureSearchers.dams.getNearest(lon, lat).distance 
          + ", distanceToRivers: " + featureSearchers.rivers.getNearest(lon, lat).distance
          + ", distanceToStream: " + featureSearchers.streams.getNearest(lon, lat).distance
          + ", distanceToRoads: " + featureSearchers.roads.getNearest(lon, lat).distance
          + ", distanceToResidences: " + featureSearchers.residential.getNearest(
            lon,
            lat,
          ).distance
          + ", distanceToFarm: " + featureSearchers.farms.getNearest(lon, lat).distance
          + ", distanceToVillage: " + featureSearchers.villages.getNearest(lon, lat).distance
          + ", distanceToTown: " + featureSearchers.towns.getNearest(lon, lat).distance
          + ", distanceToSuburb: " + featureSearchers.suburbs.getNearest(lon, lat).distance
          + ", distanceToIntermittentWater: " +  featureSearchers.intermittentWater.getNearest(
            lon,
            lat,
          ).distance
          + ", altitude: " + altitudeInfo.averageAltitude
          + ", slopiness: " + altitudeInfo.variance,
        };
       
        // tslint:disable-next-line:no-console
        const addedPoachingIncident = await con
          .getRepository(PoachingIncident)
          .save(poachingIncident);
        console.log(
          'Saved a new poaching incident with id: ' + poachingIncident.id,
        );

        return addedPoachingIncident != null;
      }
    } catch (error) {
      console.log('The type of incident does not exist.');
      return false;
    }
  }
}

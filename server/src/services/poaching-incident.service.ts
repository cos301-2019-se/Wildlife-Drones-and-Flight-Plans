import { Injectable } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { PoachingIncident } from '../entity/poaching-incident.entity';
import { PoachingIncidentType } from '../entity/poaching-incident-type.entity';
import bbox from '@turf/bbox';
import { GeoService, GeoSearchSet } from './geo.service';
import { SRTMService } from './srtm.service';
import { lengthToDegrees } from '@turf/helpers';
import { MoreThanOrEqual } from 'typeorm';
import { PoachingCellWeight } from '../entity/poaching-cell-weight.entity';
import { ConfigService } from './config.service';
import { MapService } from './map.service';
import { MapFeatureType } from '../entity/map-data.entity';

@Injectable()
export class PoachingIncidentService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mapService: MapService,
    private readonly geo: GeoService,
    private readonly altitude: SRTMService,
    private readonly config: ConfigService,
  ) {}

  async addPoachingIncident(
    lon: number,
    lat: number,
    pType: string | number,
    description: string,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    console.time('feature searchers');
    const featureSearchers = await this.mapService.getFeatureSearchSets();
    console.timeEnd('feature searchers');

    console.timeEnd('get map data');

    // if not parse then it gives not a number
    const latitude = parseFloat(lat.toString());
    const longitude = parseFloat(lon.toString());

    const altitudeInfo = await this.altitude.getAltitudeForPoint(latitude, longitude);

    try {
      const poachingIncidentType = await con
        .getRepository(PoachingIncidentType)
        .findOne(typeof pType === 'string' ? { type: pType } : { id: pType });

      console.log('poaching incident type', poachingIncidentType);

      if (typeof poachingIncidentType === 'undefined') {
        console.log('The type of incident does not exist.');
        return false;
      } else {
        const date = new Date();

        const poachingIncident = new PoachingIncident();
        poachingIncident.timestamp = date;
        poachingIncident.longitude = lon;
        poachingIncident.latitude = lat;
        poachingIncident.description = description;
        poachingIncident.type = poachingIncidentType;
        poachingIncident.month = date.getMonth() + 1;
        poachingIncident.time = date.getHours() * 60 + date.getMinutes();
        poachingIncident.properties = {
          distanceToDams: featureSearchers[MapFeatureType.dams].getNearest(lon, lat).distance,
          distanceToRivers: featureSearchers[MapFeatureType.rivers].getNearest(lon, lat).distance,
          distanceToRoads: featureSearchers[MapFeatureType.roads].getNearest(lon, lat).distance,
          distanceToResidences: featureSearchers[MapFeatureType.residential].getNearest(lon, lat).distance,
          distanceToExternalResidences: featureSearchers[MapFeatureType.externalResidential].getNearest(lon, lat).distance,
          distanceToIntermittentWater: featureSearchers[MapFeatureType.intermittent].getNearest(lon, lat).distance,
          altitude: altitudeInfo.averageAltitude,
          slopiness: altitudeInfo.variance,
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
      console.error(error);
      console.log('The type of incident does not exist.');
      return false;
    }
  }

  async getPoachingIncidentTableData(poachingIncident): Promise<JSON> {
    const con = await this.databaseService.getConnection();

    const poachingIncidentType = await
      con
        .getRepository(PoachingIncidentType)
        .findOne({ type: poachingIncident });

    try {
      return JSON.parse(
        JSON.stringify(
          await con
            .getRepository(PoachingIncident)
            .find({ type: poachingIncidentType }),
        ),
      );
    } catch (error) {
      return JSON.parse('false');
    }
  }

  async getAllPoachingIncidentTableData(): Promise<PoachingIncident[]> {
    const con = await this.databaseService.getConnection();

    try {
      return await con
        .getRepository(PoachingIncident)
        .find();
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
  /**
   * Get all poaching incidents since the given date
   * If since is null, then will return for the last week
   */
  async getPoachingIncidents(since: Date = null) {
    since = since ? since : new Date(Date.now() - 86400000 * 7);

    const con = await this.databaseService.getConnection();
    const incidentsRepository = con.getRepository(PoachingIncident);

    return await incidentsRepository.find({
      where: {
        timestamp: MoreThanOrEqual(since),
      },
      loadRelationIds: true,
    });
  }

  async getPoachingWeights() {
    const con = await this.databaseService.getConnection();

    try {
      let cellsData = await con.getRepository(PoachingCellWeight)//.find({ relations: ["cell"] });
      .createQueryBuilder('data')   
      .innerJoinAndSelect("data.cell", "id")
      .select(['id.id','data.weight'])
      .getMany();

   // let cellsData = await con.getRepository(AnimalCellWeight).find();

      // tslint:disable-next-line:no-console
      console.log(cellsData); 
      //console.log('Cells data retrieved');     
      return JSON.parse(JSON.stringify(cellsData));
    } catch (error) {
      console.log(error);
      console.log('Cells data not retrieved');
      return JSON.parse('false');
    }
  }
}

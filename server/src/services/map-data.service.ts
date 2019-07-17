/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { MapData } from '../entity/map-data.entity';

@Injectable()
export class MapDataService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Adds map data to the system used for caching 
   * @param feature The feature of the map that is being added 
   * @param properties The properties of the feature being added to the map
   * 
   */
  async addMapData(feature: string, properties: JSON): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const mapData = new MapData();

    try {
      mapData.feature = feature;
      mapData.properties = JSON.stringify(properties);
      // tslint:disable-next-line:no-console
      const addedFeature = await con.getRepository(MapData).save(mapData);
      console.log('Saved map data with feature name: ' + mapData.feature);
      return addedFeature != null;
    } catch (error) {
      console.log('Map data not saved.');
      return false;
    }
  }

  /**
   * Retrieves  map data fromn the system used for displaying contemt on the application 
   * @param featureName  The name of feature that is being retrieved  
   * 
   */
  async getMapFeature(featureName: string): Promise<any> {
    const conn = await this.databaseService.getConnection();
    const mapData = conn.getRepository(MapData);

    const feature = await mapData.findOne({
      where: {
        feature: featureName,
      },
    });

    if (!feature) {
      return undefined;
    }

    return JSON.parse(feature.properties);
  }
}

/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { MapData } from '../entity/map-data.entity';

@Injectable()
export class MapDataService {
    constructor(private readonly databaseService: DatabaseService) { }

    async addMapData(feature: string, properties: JSON ): Promise<boolean> {
        const con = await this.databaseService.getConnection();
        const mapData = new MapData();

        try {
            mapData.feature = feature;
            mapData.properties = JSON.stringify(properties);
            // tslint:disable-next-line:no-console
            const addedFeature = await con.getRepository(MapData).save(mapData);
            console.log(
                'Saved map data with feature name: ' + mapData.feature,
            );
            return addedFeature != null;
        } catch (error) {
            console.log("Map data not saved.");
            return false;
        }
    }
}

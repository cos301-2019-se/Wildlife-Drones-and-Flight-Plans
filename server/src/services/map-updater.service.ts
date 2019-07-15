import { Injectable } from '@nestjs/common';

import { OverpassService } from './overpass.service';
import { MapPartitionerService } from './map-partitioner.service';

import { DatabaseService } from './db.service';
import { MapDataService } from '../services/map-data.service';
import { ReserveConfiguration } from '../entity/reserve-configuration.entity';
import { ConfigService } from './config.service';
@Injectable()
export class MapUpdaterService {
  constructor(
    private overpass: OverpassService,
    private mapPartitioner: MapPartitionerService,
    private databaseService: DatabaseService,
    private config: ConfigService,
  ) {}

  /**
   * Updates the map given the name of a reserve
   * @param name The name of the reserve
   */
  async updateMap(name: string) {
    const config = await this.config.getConfig();
    config.reserveName = name;

    // save the reserve name for the system
    await this.config.setConfig(config);

    const { reserve, features } = await this.getMapFeatures(config.reserveName);

    const grid = await this.mapPartitioner.partitionMap(reserve, features, config.cellSize);

    return {
      ...features,
      reserve,
      grid,
    };
  }

  async getMapFeatures(name: string) {
    // tslint:disable-next-line:no-console
    console.log('map name', name);
    name = name.replace(/[\[\]()"']/, ''); // sanitise

    const reserves = await this.overpass.query(`relation["name"="${name}"];
      (._;>;);
      out geom;
    `);
    // tslint:disable-next-line:no-console
    console.log('reserves', reserves.features.length);

    //map service instance
    let mapData = new MapDataService(this.databaseService);

    //save to table
    await mapData.addMapData('reserve', reserves.features[0]);

    const dams = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
      (
        (
          (
            nwr(area.boundaryarea)[water];
            nwr(area.boundaryarea)[natural="water"];
          ); -
          nwr(area.boundaryarea)[waterway];
        );
        - nwr(area.boundaryarea)[intermittent=yes];
      );
      (._;>;);
      out geom;
      >;`);
    // tslint:disable-next-line:no-console
    console.log('dams', dams.features.length);

    // //save to table
    await mapData.addMapData('dams', dams.features);

    const rivers = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
    (
      nwr(area.boundaryarea)[waterway=river];
      - nwr(area.boundaryarea)[intermittent=yes];
    );
    (._;>;);
    out geom;
    >;`);
    // tslint:disable-next-line:no-console
    console.log('rivers', rivers.features.length);

    //save to table
    await mapData.addMapData('rivers', rivers.features);

    const intermittentWater = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
      (
        nwr(area.boundaryarea)[water][intermittent=yes];
        nwr(area.boundaryarea)[natural=water][intermittent=yes];
        nwr(area.boundaryarea)[waterway][intermittent=yes];
      );
      out geom;`);
    // tslint:disable-next-line:no-console
    console.log('intermittent', intermittentWater.features.length);

    //save to table
    await mapData.addMapData('intermittent', intermittentWater.features);

    const roads = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
    (
      nwr(area.boundaryarea)[highway];
      nwr(area.boundaryarea)[route=road];
    );
    out geom;`);
    // tslint:disable-next-line:no-console
    console.log('roads', roads.features.length);

    //save to table
    await mapData.addMapData('roads', roads.features);

    const residential = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
      (
        nwr(area.boundaryarea)[landuse=residential];
        nwr(area.boundaryarea)[barrier=fence];
      );
      out geom;`);

    //save to table
    await mapData.addMapData('residential', residential.features);

    console.log('residential', residential.features.length);

    const farms = await this.overpass
      .query(`node["name"="${name}"];
      (       
         nwr["name"="${name}"];
         node  (around:5000)
              ["place"= "farm"];
      );             
      out geom;`);

    await mapData.addMapData('farms', farms.features);

    // tslint:disable-next-line:no-console
    console.log('farms', farms.features.length);

    const streams = await this.overpass
      .query(` area["name"="${name}"]->.boundaryarea;
      (
        nwr(area.boundaryarea)[waterway=stream];
        - nwr(area.boundaryarea)[intermittent=yes];
      );
      (._;>;);
      out geom;
      >;`);
    // tslint:disable-next-line:no-console
    console.log('streams', streams.features.length);

    //save to table
    await mapData.addMapData('streams', streams.features);

    const suburbs = await this.overpass
      .query(`node["name"="${name}"];
      (       
         nwr["name"="${name}"];
         node  (around:5000)
              ["place"= "suburb"];
      );             
      out geom;`);
    // tslint:disable-next-line:no-console
    console.log('suburbs', suburbs.features.length);

    //save to table
    await mapData.addMapData('suburbs', suburbs.features);

    const villages = await this.overpass
      .query(`node["name"="${name}"];
      (       
         nwr["name"="${name}"];
         node  (around:5000)
              ["place"= "village"];
      );             
      out geom;`);
    // tslint:disable-next-line:no-console
    console.log('villages', villages.features.length);

    //save to table
    await mapData.addMapData('villages', villages.features);

    const towns = await this.overpass
      .query(`node["name"="${name}"];
      (       
         nwr["name"="${name}"];
         node  (around:5000)
              ["place"= "town"];
      );             
      out geom;`);
    // tslint:disable-next-line:no-console
    console.log('towns', towns.features.length);

    //save to table
    await mapData.addMapData('towns', towns.features);

    // tslint:disable-next-line:no-console
    console.log('downloaded map data');

    const reserve = reserves.features[0];

    return {
      reserve,
      features: {
        dams: dams.features,
        rivers: rivers.features,
        intermittentWater: intermittentWater.features,
        roads: roads.features,
        residential: residential.features,
        streams: streams.features,
        towns: towns.features,
        suburbs: suburbs.features,
        villages: villages.features,
        farms: farms.features,
      },
    };
  }

  /**
   * Returns a list of reserves in a given bounding box
   * @param left
   * @param bottom
   * @param right
   * @param top
   */
  async findReservesInArea(left, bottom, right, top) {
    const query = `nwr[leisure=nature_reserve](${bottom},${left},${top},${right});(._;>;);out;`;
    return await this.overpass.query(query);
  }
}

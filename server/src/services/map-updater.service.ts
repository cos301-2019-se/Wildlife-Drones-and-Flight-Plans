import { Injectable } from '@nestjs/common';

import { OverpassService } from './overpass.service';
import { MapPartitionerService } from './map-partitioner.service';

import { DatabaseService } from './db.service';
import { MapData } from '../entity/map-data.entity'

@Injectable()
export class MapUpdaterService {
  constructor(
    private overpass: OverpassService,
    private mapPartitioner: MapPartitionerService,
    private databaseService: DatabaseService,
  ) {}

  /**
   * Updates the map given the name of a reserve
   * @param name The name of the reserve
   */
  async updateMap(name: string) {
    const { reserve, features } = await this.getMapFeatures(name);

    const grid = await this.mapPartitioner.partitionMap(reserve, features, 1);

    console.log('grid', grid);

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

    const conn = await this.databaseService.getConnection();
    const mapDataCon = await conn.getRepository(MapData);

    let mapData: MapData;


    //save to table
    mapData = {feature: 'reserve', properties: JSON.stringify(reserves.features)};
    await mapDataCon.save(mapData);

    //console.log(reserves.features);

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
    mapData = {feature: 'dams', properties: JSON.stringify(dams.features)};
    await mapDataCon.save(mapData);


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
    mapData = {feature: 'rivers', properties: JSON.stringify(rivers.features)};
    await mapDataCon.save(mapData);

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
    mapData = {feature: 'intermittent Water', properties: JSON.stringify(intermittentWater.features)};
    await mapDataCon.save(mapData);

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
    mapData = {feature: 'roads', properties: JSON.stringify(roads.features)};
    await mapDataCon.save(mapData);

    const residential = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
      (
        nwr(area.boundaryarea)[landuse=residential];
        nwr(area.boundaryarea)[barrier=fence];
      );
      out geom;`);

      //save to table
    mapData = {feature: 'residential', properties: JSON.stringify(residential.features)};
    await mapDataCon.save(mapData);

    // tslint:disable-next-line:no-console
    console.log('residential', residential.features.length);
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

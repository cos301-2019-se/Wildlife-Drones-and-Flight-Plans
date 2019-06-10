import { Injectable } from '@nestjs/common';

import { OverpassService } from './overpass.service';
import { MapPartitionerService } from './map-partitioner.service';

import { DatabaseService } from './db.service';
import { ReserveConfiguration } from '../entity/reserve-configuration.entity'


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

    const dbConn = await this.databaseService.getConnection();
    const reserveConfigCon = await dbConn.getRepository(ReserveConfiguration);

    let reserveConfig: ReserveConfiguration = {reserveName: name, cellSize: 1};
    await reserveConfigCon.save(reserveConfig);

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

    const roads = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
    (
      nwr(area.boundaryarea)[highway];
      nwr(area.boundaryarea)[route=road];
    );
    out geom;`);
    // tslint:disable-next-line:no-console
    console.log('roads', roads.features.length);

    const residential = await this.overpass
      .query(`area["name"="${name}"]->.boundaryarea;
      (
        nwr(area.boundaryarea)[landuse=residential];
        nwr(area.boundaryarea)[barrier=fence];
      );
      out geom;`);

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

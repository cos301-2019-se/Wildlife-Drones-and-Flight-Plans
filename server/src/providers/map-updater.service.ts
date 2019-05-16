import { Injectable } from '@nestjs/common';

import { OverpassService } from './overpass.service';
import { MapPartitionerService } from './map-partitioner.service';

@Injectable()
export class MapUpdaterService {

  constructor(
    private overpass: OverpassService,
    private mapPartitioner: MapPartitionerService,
  ) {}

  /**
   * Updates the map given the name of a reserve
   * @param name 
   */
  async updateMap(name: string) {
    name = name.replace(/[\[\]\(\)\"\']/, ''); // sanitise

    const reserves = await this.overpass.query(`relation["name"="${name}"]["type"="boundary"];
      (._;>;);
      out geom;
    `);
    console.log('reserves', reserves.features.length);

    const dams = await this.overpass.query(`area["name"="${name}"]->.boundaryarea;
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
    console.log('dams', dams.features.length);

    const rivers = await this.overpass.query(`area["name"="${name}"]->.boundaryarea;
    (
      nwr(area.boundaryarea)[waterway=river];
      - nwr(area.boundaryarea)[intermittent=yes];
    );
    (._;>;);
    out geom;
    >;`);
    console.log('rivers', rivers.features.length);

    const intermittentWater = await this.overpass.query(`area["name"="${name}"]->.boundaryarea;
      (
        nwr(area.boundaryarea)[water][intermittent=yes];
        nwr(area.boundaryarea)[natural=water][intermittent=yes];
        nwr(area.boundaryarea)[waterway][intermittent=yes];
      );
      out geom;`);
    console.log('intermittent', intermittentWater.features.length);

    const roads = await this.overpass.query(`area["name"="${name}"]->.boundaryarea;
    (
      nwr(area.boundaryarea)[highway];
      nwr(area.boundaryarea)[route=road];
    );
    out geom;`);
    console.log('roads', roads.features.length);

    console.log('downloaded map data');

    const reserve = reserves.features[0];

    const allFeatures = {
      dams: dams.features,
      rivers: rivers.features,
      intermittentWater: intermittentWater.features,
      roads: roads.features,
    };

    const grid = this.mapPartitioner.partitionMap(reserve, allFeatures, 1);

    return {
      ...allFeatures,
      reserve,
      grid,
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
    const query = `node[leisure=nature_reserve](${bottom},${left},${top},${right});out;`;
    return await this.overpass.query(query);
  }
}
import { Injectable } from '@nestjs/common';

import { OverpassService } from './overpass.service';

@Injectable()
export class MapUpdaterService {

  constructor(private overpass: OverpassService) {}

  /**
   * Updates the map given the name of a reserve
   * @param name 
   */
  async updateMap(name: string) {
    name = name.replace(/[\[\]\(\)\"\']/, ''); // sanitise

    const reserve = await this.overpass.query(`relation["name"="${name}"]["type"="boundary"];
      /*added by auto repair*/
      (._;>;);
      /*end of auto repair*/
      out geom meta;
    `);
    console.log('reserve:');
    console.dir(reserve, {
      depth: null,
    });
    const dams = await this.overpass.query(`area["name"="${name}"]->.boundaryarea;
    (
      nwr(area.boundaryarea)[leisure=reserve];
      nwr(area.boundaryarea)[water];
      nwr(area.boundaryarea)[waterway];
      nwr(area.boundaryarea)[natural="water"];
    );
    out geom meta;`);
    console.log('dams', dams);

    const roads = await this.overpass.query(`area["name"="${name}"]->.boundaryarea;
    (
      nwr(area.boundaryarea)[highway];
      nwr(area.boundaryarea)[route=road];
    );
    out geom meta;`);
    console.log('roads', roads);

    console.log('downloaded map data');

    const allFeatures = {
      reserve: reserve.features[0],
      dams: dams.features,
      roads: roads.features,
    };
    return allFeatures;
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
    // const query = `relation[leisure=nature_reserve]["type"="boundary"](${bottom},${left},${top},${right});
    //   /*added by auto repair*/
    //   (._;>;);
    //   /*end of auto repair*/
    //   out;
    // `;
    console.log(query);
    return await this.overpass.query(query);
  }



}/*
This is an example Overpass query.
Try it out by pressing the Run button above!
You can find more examples with the Load tool.
*/
// node[leisure=nature_reserve](-25.562265014427492,30.794677734375,-22.263680482353216,32.1405029296875);out;
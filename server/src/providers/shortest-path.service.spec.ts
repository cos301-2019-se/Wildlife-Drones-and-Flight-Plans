import {ShortestPathService} from './shortest-path.service';
import {MapUpdaterService} from './map-updater.service';


jest.setTimeout(30000);

describe('Unit Testing',()=>{
    const shortestPath = new ShortestPathService();
    const mapUpdater = new MapUpdaterService();
    /////////////////All tests for shortest path///////////////////
    const onePoints = [[8,5]];
const Twopoints = [[8,5],[2,2]];
const Fivepoints = [[8,5],[2,2],[13,16],[22,27],[6,90]];
const expectedOnePoints = [[8,5],[8,5]];
const expectedTwoPoints = [[8,5],[2,2],[8,5]];
const expectedFivePoints =  [[8, 5], [2, 2], [6, 90], [22, 27], [13, 16], [8, 5]];
    describe('Get shortest path between one point(s)',()=>{
        it('Was shortest path',async()=>{
            const res = shortestPath.getShortestPath(onePoints);
            expect(res).toEqual(expectedOnePoints);
        });
    });

    describe('Get shortest path between two point(s)',()=>{
        it('Was shortest path',async()=>{
            const res = shortestPath.getShortestPath(Twopoints);
            expect(
              JSON.stringify(res) == JSON.stringify(expectedTwoPoints) ||
              JSON.stringify(res) == JSON.stringify(expectedTwoPoints.reverse())
            ).toBeTruthy();
        });
    });

    describe('Get shortest path between five point(s)',()=>{
        it('Was shortest path',async()=>{
            const res = shortestPath.getShortestPath(Fivepoints);
            expect(
              JSON.stringify(res) == JSON.stringify(expectedFivePoints) ||
              JSON.stringify(res) == JSON.stringify(expectedFivePoints.reverse())
            ).toBeTruthy();
        });
    });
    //////////////////////END//////////////////////////////////

    const outerPolygon = [[
        [
          28.25408935546875,
          -25.82708887795793
        ],
        [
          28.22662353515625,
          -25.941991877144932
        ],
        [
          28.34197998046875,
          -25.964218242810375
        ],
        [
          28.35845947265625,
          -25.841921351954834
        ],
        [
          28.25408935546875,
          -25.82708887795793
        ]
      ]];

  const innerPolygon =    [[
        [
          28.270568847656246,
          -25.862930840255185
        ],
        [
          28.2623291015625,
          -25.90740919272412
        ],
        [
          28.307647705078125,
          -25.91729099501283
        ],
        [
          28.317260742187496,
          -25.872816366379094
        ],
        [
          28.270568847656246,
          -25.862930840255185
        ]
      ]];

     const point = [[
        28.28704833984375,
        -25.89134949832312
      ]];
const line = [[
    [
      28.324127197265625,
      -25.915438220157668
    ],
    [
      28.308334350585938,
      -25.946931432160188
    ]
  ]];
    describe('Tests if one polygon is in another polygon',()=>{
        it('Polygon is in polygon',async()=>{
            const res = mapUpdater.isInPolygon(innerPolygon,outerPolygon);
            expect(res).toEqual(true);
        });
    });

    describe('Tests if a point is in a polygon',()=>{
        it('Point is in polygon',async()=>{
            const res = mapUpdater.isInPolygon(point,outerPolygon);
            expect(res).toEqual(true);
        });
    });

    describe('Tests if a line is in a polygon',()=>{
        it('Line is in polygon',async()=>{
            const res = mapUpdater.isInPolygon(line,outerPolygon);
            expect(res).toEqual(true);
        });
    });


// -check features recived from openview maps (roads > 0, dams > 0)
var Correcttop =-25.8415;
var Correctleft =28.2560;
var Correctbottom = -25.9392;
var Correctright =28.3320;
//var Wrongtop =-26.236496215382555;
//var Wrongleft =28.429269790649414;
//var Wrongbottom = -26.239845151660266;
//var Wrongright =28.435921669006348;
    var Correctres;
    var Wrongres;
    describe('Tests to see if there is more than 0 dams on the map',()=>{
        it('More than 0 dams are on the map',async()=>{
            Correctres = await mapUpdater.updateMap(Correctleft, Correctbottom, Correctright, Correcttop);
                expect(Correctres.dams.length).toBeGreaterThan(0); 
                     
        });
    });

    describe('Tests to see if there is more than 0 roads on the map',()=>{
        it('More than 0 roads are on the map',async()=>{
                expect(Correctres.roads.length).toBeGreaterThan(0);
        });
    });
    
    describe('Tests to see if there are reserves on the map',()=>{
        it('There are reserves',async()=>{
                expect(Correctres.reserve).toBeDefined();       
        });
    }); 

    /*describe('Tests to see if there is dams on the map',()=>{
        it('There is no dams on the map',async()=>{
            Wrongres = await mapUpdater.updateMap(Wrongleft, Wrongbottom, Wrongright, Wrongtop);
                expect(Wrongres.dams.length).toEqual(0); 
                     
        });
    });

    describe('Tests to see if there is roads on the map',()=>{
        it('There is no roads on the map',async()=>{
                expect(Wrongres.roads.length).toEqual(0);       
        });
    });
    
    describe('Tests to see if there are reserves on the map',()=>{
        it('There are no reserves',async()=>{
                expect(Wrongres.reserve).toBeUndefined();       
        });
    }); */
});
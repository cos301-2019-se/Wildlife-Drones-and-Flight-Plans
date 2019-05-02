import {ShortestPathService} from './shortest-path.service';
import {MapUpdaterService} from './map-updater.service';


jest.setTimeout(30000);

describe('Unit Testing',()=>{
    const shortestPath = new ShortestPathService();
    const mapUpdater = new MapUpdaterService();
    /////////////////All tests for shortest path///////////////////
    const onePoints = [{x:8,y:5}];
const Twopoints = [{x:8,y:5},{x:2,y:2}];
const Fivepoints = [{x:8,y:5},{x:2,y:2},{x:13,y:16},{x:22,y:27},{x:6,y:90}];
const expectedOnePoints = [{x:8,y:5},{x:8,y:5}];
const expectedTwoPoints = [{x:8,y:5},{x:2,y:2},{x:8,y:5}];
const expectedFivePoints = [{x:8,y:5},{x:2,y:2},{x:13,y:16},{x:22,y:27},{x:6,y:90},{x:8,y:5}];
    describe('Get shortest path between one point(s)',()=>{
        it('Was shortest path',async()=>{
            const res = shortestPath.getShortestPath(onePoints);
            expect(res).toEqual(expectedOnePoints);
        });
    });

    describe('Get shortest path between two point(s)',()=>{
        it('Was shortest path',async()=>{
            const res = shortestPath.getShortestPath(Twopoints);
            expect(res).toEqual(expectedTwoPoints);
        });
    });

    describe('Get shortest path between five point(s)',()=>{
        it('Was shortest path',async()=>{
            const res = shortestPath.getShortestPath(Fivepoints);
            expect(res).toEqual(expectedFivePoints);
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
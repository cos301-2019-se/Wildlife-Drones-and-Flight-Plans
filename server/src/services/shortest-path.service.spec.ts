import { ShortestPathService } from './shortest-path.service';
import { MapUpdaterService } from './map-updater.service';

import { GeoService } from './geo.service';
import { SRTMService } from './srtm.service';
import { OverpassService } from './overpass.service';
import { MapPartitionerService } from './map-partitioner.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './db.service';
import { MapCellDataService } from './map-cell-data.service';

jest.setTimeout(30000);
let controller;
beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [],
    // controllers: [AnimalController],
    providers: [
      MapUpdaterService,
      GeoService,
      SRTMService,
      OverpassService,
      MapPartitionerService,
      ShortestPathService,
      DatabaseService,
      MapCellDataService,
    ],
  }).compile();
  controller = await module.get(ShortestPathService);
  //controller = await module.get<ShortestPathService>(ShortestPathService);
});
describe('Unit Testing', () => {
  //const shortestPath = new ShortestPathService();
  // const mapUpdater = new MapUpdaterService();
  ///////////////// All tests for shortest path///////////////////
  const onePoints = [[8, 5]];
  const twoPoints = [[8, 5], [2, 2]];
  const fivePoints = [[8, 5], [2, 2], [13, 16], [22, 27], [6, 90]];
  const expectedOnePoints = [[8, 5], [8, 5]];
  const expectedTwoPoints = [[8, 5], [2, 2], [8, 5]];
  const expectedFivePoints = [
    [8, 5],
    [2, 2],
    [6, 90],
    [22, 27],
    [13, 16],
    [8, 5],
  ];
  describe('Get shortest path between one point(s)', () => {
    it('Was shortest path', async () => {
      const res = await controller.getShortestPath(onePoints);
      expect(res).toEqual(expectedOnePoints);
    });
  });

  describe('Get shortest path between two point(s)', () => {
    it('Was shortest path', async () => {
      const res = await controller.getShortestPath(twoPoints);
      expect(
        JSON.stringify(res) === JSON.stringify(expectedTwoPoints) ||
          JSON.stringify(res) === JSON.stringify(expectedTwoPoints.reverse()),
      ).toBeTruthy();
    });
  });

  describe('Get shortest path between five point(s)', () => {
    it('Was shortest path', async () => {
      const res = await controller.getShortestPath(fivePoints);
      expect(
        JSON.stringify(res) === JSON.stringify(expectedFivePoints) ||
          JSON.stringify(res) === JSON.stringify(expectedFivePoints.reverse()),
      ).toBeTruthy();
    });
  });
  ////////////////////// END//////////////////////////////////
});

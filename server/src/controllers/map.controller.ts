import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ShortestPathService } from '../services/shortest-path.service';
import { MapUpdaterService } from '../services/map-updater.service';
import { MapDataService } from '../services/map-data.service';
import { MapCellDataService } from '../services/map-cell-data.service';

@Controller('map')
@UseGuards(AuthGuard('jwt'))
export class MapController {
  constructor(
    private shortestPathService: ShortestPathService,
    private mapUpdaterService: MapUpdaterService,
    private mapDataService: MapDataService,
    private mapCellDataService: MapCellDataService,
  ) {}

 /**
   * Makes a get request to the random-path function
   * Returns a random path to follow upon successfull execution
   * @param top A random number generated for the border
   * @param bottom A random number generated for the border
   * @param left A random number generated for the border
   * @param right A random number generated for the border
   * @param startX A random number coordinate to start at
   * @param startY A random number coordinate to start at
   */

  @Get('random-path')
  getRandomPath(
    @Query('top') top: number,
    @Query('left') left: number,
    @Query('bottom') bottom: number,
    @Query('right') right: number,
    @Query('startX') startX: number,
    @Query('startY') startY: number,
  ) {
    const NUM_POINTS = 5;
    const points = new Array(NUM_POINTS)
      .fill(undefined)
      .map(() => [
        Math.random() * (right - left) + Number(left),
        Math.random() * (top - bottom) + Number(bottom),
      ]);

    points.unshift([startX, startY]);

    return this.shortestPathService.getShortestPath(points);
  }


  /**
   * Finds the shortest path between a number of points
   * Returns the shortest path between points
   * @param points Are the points between which the distances need to be calculated
   */

  @Post('shortest-path')
  shortestPath(@Body('points') points) {
    return this.shortestPathService.getShortestPath(points);
  }

   /**
   * Finds the reserve on the map in the application
   * @param top The top border of the selected area
   * @param bottom The bottom border of the selected area
   * @param left The left border of the selected area
   * @param right The right border of the selected area
   */

  @Post('find-reserves')
  async findReserves(
    @Body('top') top,
    @Body('left') left,
    @Body('bottom') bottom,
    @Body('right') right,
  ) {
    // tslint:disable-next-line:no-console
    console.log(left, bottom, right, top);
    return await this.mapUpdaterService.findReservesInArea(
      left,
      bottom,
      right,
      top,
    );
  }


  /**
   * Updates the reserve selected by a user
   * @param name The name of the selected game reserve
   */
  
  @Post('update')
  async update(@Body('name') name) {
    return await this.mapUpdaterService.updateMap(name);
  }

  /**
   * Returns all map data of the reserve 
   */

  @Post('reserve')
  async getReserve() {
    return await this.mapDataService.getMapFeature('reserve');
  }

  @Post('getMapCells')
  getMapCells() {    
    console.log('calling');
    return this.mapCellDataService.getMapCells();
  }

  /**
   * Gets the size of a map cell from the database
   */
  @Post('getCellSize')
  async getCellSize(): Promise<number> {
    return await this.mapDataService.getCellSize();
  }
}

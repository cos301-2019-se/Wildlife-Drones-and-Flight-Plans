import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ShortestPathService } from '../services/shortest-path.service';
import { MapService } from '../services/map.service';
import { MapFeatureType } from '../entity/map-data.entity';

@Controller('map')
@UseGuards(AuthGuard('jwt'))
export class MapController {
  constructor(
    private shortestPathService: ShortestPathService,
    private mapService: MapService,
  ) {}

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

  @Post('shortest-path')
  shortestPath(@Body('points') points) {
    return this.shortestPathService.getShortestPath(points);
  }

  @Post('find-reserves')
  async findReserves(
    @Body('top') top,
    @Body('left') left,
    @Body('bottom') bottom,
    @Body('right') right,
  ) {
    // tslint:disable-next-line:no-console
    console.log(left, bottom, right, top);
    return await this.mapService.findReservesInArea(
      left,
      bottom,
      right,
      top,
    );
  }

  @Post('update')
  async update() {
    return await this.mapService.updateMap();
  }

  @Post('reserve')
  async getReserve() {
    return await this.mapService.getMapFeature(MapFeatureType.reserve);
  }

  @Post('getMapCells')
  getMapCells() {
    console.log('calling');
    return this.mapService.getMapCells();
  }

  @Post('getSpeciesWeightDataForTime')
  async getSpeciesWeightDataForTime(@Body() body) {
    console.log('calling');
    return await this.mapService.getSpeciesWeightDataForTime(
      body.species,
      body.time,
    );
  }

  @Post('getCellPoachingWeight')
  async getCellPoachingWeight() {
    console.log('calling');
    return await this.mapService.getCellPoachingWeight();
  }

  /**
   * Gets the size of a map cell from the database
   */
  @Post('getCellSize')
  async getCellSize(): Promise<number> {
    return await this.mapService.getCellSize();
  }
}

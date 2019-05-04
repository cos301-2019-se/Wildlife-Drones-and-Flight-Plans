import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { ShortestPathService } from '../providers/shortest-path.service';
import { MapUpdaterService } from '../providers/map-updater.service';

// jest.setTimeout(-1);
//jest.useFakeTimers();

@Controller('map')
export class MapController {

    constructor(
        private shortestPathService: ShortestPathService,
        private mapUpdaterService: MapUpdaterService,
    ) {}

    @Get('random-path')
    getRandomPath(@Query('top') top: number,
                  @Query('left') left: number,
                  @Query('bottom') bottom: number,
                  @Query('right') right: number,
                  @Query('startX') startX: number,
                  @Query('startY') startY: number) {
        const NUM_POINTS = 5;
        const points = new Array(NUM_POINTS).fill(undefined)
          .map(p => [
                (Math.random() * (right - left)) + (left - 0),
                (Math.random() * (top - bottom)) + (bottom - 0)
            ]);

        points.unshift([startX, startY]);

        return this.shortestPathService.getShortestPath(points);
    }

    @Post('shortest-path')
    shortestPath(@Body('points') points) {
        return this.shortestPathService.getShortestPath(points);
    }

    @Post('update')
    async update(@Body('top') top, @Body('left') left, @Body('bottom') bottom, @Body('right') right) {
        const mapFeatures = await this.mapUpdaterService.updateMap(left, bottom, right, top);
        console.log(mapFeatures);
        return mapFeatures;
    }
}
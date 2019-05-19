import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ShortestPathService } from '../providers/shortest-path.service';
import { MapUpdaterService } from '../providers/map-updater.service';

// jest.setTimeout(-1);
// jest.useFakeTimers();

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
          .map(() => [
                (Math.random() * (right - left)) + Number(left),
                (Math.random() * (top - bottom)) + Number(bottom)
            ]);

        points.unshift([startX, startY]);

        return this.shortestPathService.getShortestPath(points);
    }

    @Post('shortest-path')
    shortestPath(@Body('points') points) {
        return this.shortestPathService.getShortestPath(points);
    }

    @Post('find-reserves')
    async findReserves(@Body('top') top, @Body('left') left, @Body('bottom') bottom, @Body('right') right) {
        // tslint:disable-next-line:no-console
        console.log(left, bottom, right, top);
        return await this.mapUpdaterService.findReservesInArea(left, bottom, right, top);
    }

    @Post('update')
    async update(@Body('name') name) {
        // console.log(mapFeatures);
        return await this.mapUpdaterService.updateMap(name);
    }
}
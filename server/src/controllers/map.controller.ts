import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('map')
export class MapController {
  @Get('random-path')
  getRandomPath(@Query('top') top: number, @Query('left') left: number, @Query('bottom') bottom: number, @Query('right') right: number) {
    var lPoints = [];
    var y = -1.0;
    var x = -1.0;
    for (let i = 0; i < 6; i++) {
      y = (Math.random() * (top - bottom)) + (bottom - 0); // do not question me!
      x = (Math.random() * (right - left)) + (left - 0); // do not question me!
      lPoints.push({x, y});
      // console.log((Math.random() * (top - bottom)) + bottom);
    }
    // console.log(lPoints);
    return lPoints;
  }
}

import { Controller, Get } from '@nestjs/common';

@Controller('map')
export class MapController {
  @Get('random-path')
  getRandomPath() {
    return [5, 1, 2];
  }
}

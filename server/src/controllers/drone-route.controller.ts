import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { DroneRouteService } from '../services/drone-route.service';

@Controller()
export class DroneRouteController {
  constructor(private readonly droneRouteService: DroneRouteService) {}

  //add drone route info to drone route table in database
  // @Get('addDroneRoute')
  // async addDroneRoute(
  //   @Query('routeId') id: number,
  //   @Query('points') points: string,
  // ): Promise<boolean> {
  //   return this.droneRouteService.addDroneRoute(id, points);
  // }

  @Post('addDroneRoute')
  async addDroneRoute(@Body() body): Promise<boolean>{
    return await this.droneRouteService.addDroneRoute(body.id, body.points);
  }

  //update drone route info in table
  // @Get('updateDroneRoute')
  // async updateDroneRoute(
  //   @Query('routeId') id: number,
  //   @Query('points') points: string,
  //   @Query('percent') percent: number,
  // ): Promise<boolean> {
  //   return this.droneRouteService.updateDroneRoute(id, points, percent);
  // }
  @Post('updateDroneRoute')
  async updateDroneRoute(@Body() body) : Promise <boolean> {
    return await this.droneRouteService.updateDroneRoute(body.id, body.points, body.percent);
  }

  //deactivate drone in table
  // @Get('deactivateDroneRoute')
  // async deactivateDroneRoute(@Query('routeid') id: number): Promise<boolean> {
  //   return this.droneRouteService.deactivateDroneRoute(id);
  // }
  @Post('deactivateDroneRoute')
  async deactivateDroneRoute(@Body() body) : Promise <boolean> {
    return await this.droneRouteService.deactivateDroneRoute(body.id);
  }

}

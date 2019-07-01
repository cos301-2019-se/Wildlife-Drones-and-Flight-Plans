import { Controller, Get, Query } from '@nestjs/common';
import { DroneRouteService } from '../services/drone-route.service';

@Controller()
export class DroneRouteController {
  constructor(private readonly droneRouteService: DroneRouteService) {}

  //add drone route info to drone route table in database
  @Get('addDroneRoute')
  async addDroneRoute(
    @Query('routeId') id: number,
    @Query('points') points: string,
  ): Promise<boolean> {
    return this.droneRouteService.addDroneRoute(id, points);
  }

  //update drone route info in table
  @Get('updateDroneRoute')
  async updateDroneRoute(
    @Query('routeId') id: number,
    @Query('points') points: string,
    @Query('percent') percent: string,
  ): Promise<boolean> {
    return this.droneRouteService.updateDroneRoute(id, points, percent);
  }

  //deactivate drone in table
  @Get('deactivateDroneRoute')
  async deactivateDroneRoute(@Query('routeid') id: number): Promise<boolean> {
    return this.droneRouteService.deactivateDroneRoute(id);
  }
}

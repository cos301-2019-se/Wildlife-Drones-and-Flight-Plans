import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DroneRouteService } from '../services/drone-route.service';

// @UseGuards(AuthGuard('jwt'))
@Controller('drone-route')
export class DroneRouteController {
  constructor(
    private readonly droneRouteService: DroneRouteService,
  ) {}

  /**
   * Create an incident route for the latest incidents
   * @param body
   */
  @Post('create-incident-route')
  async createIncidentRoute(@Body() body) {
    return await this.droneRouteService.createIncidentRoutes(
      body.droneId,
      body.lon,
      body.lat,
    );
  }

  /**
   * Create a route that intercepts animals wjere possible
   * @param body
   */
  @Post('create-animal-prediction-route')
  async createAnimalPredictionRoute(@Body() body) {
    return await this.droneRouteService.createAnimalPredictionRoute(
      body.droneId,
      body.lon,
      body.lat,
      body.animalIds,
    );
  }
}

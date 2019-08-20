import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DroneRouteService } from '../services/drone-route.service';

// @UseGuards(AuthGuard('jwt'))
@Controller('drone-route')
export class DroneRouteController {
  constructor(
    private readonly droneRouteService: DroneRouteService,
  ) {}

  @Post('create-incident-route')
  async createIncidentRoute(@Body() body) {
    return await this.droneRouteService.createIncidentRoutes(body.droneId, body.lon, body.lat);
  }

  @Post('create-animal-prediction-route')
  async createAnimalPredictionRoute(@Body() body) {
    return await this.droneRouteService.createAnimalPredictionRoute(
      body.droneId,
      31.787223815917965,
      -24.761484760179226,
      body.animalIds,
    );
  }
}

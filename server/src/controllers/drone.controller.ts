import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { DroneService } from '../services/drone.service';
import { Drone } from '../entity/drone.entity';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { DroneRoute } from 'src/entity/drone-route.entity';
 @UseGuards(AuthGuard('jwt'))
@Controller()
export class DroneController {
  constructor(private readonly droneService: DroneService) {}

  @Post('addDrone')
  async addDrone(@Body() body): Promise<boolean> {
    return await this.droneService.addDrone(
      body.name,
      body.avgSpeed,
      body.avgFlightTime,
      body.speed,
      body.flightTime,
      body.lon,
      body.lat,
    );
  }

  @Post('updateDronePosition')
  async updateDrone(@Body() body): Promise<boolean> {
    return await this.droneService.updateDronePosition(
      body.droneId,
      body.longitude,
      body.latitude,
    );
  }

  @Post('deactivateDrone')
  async deactivateDrone(@Body() body): Promise<boolean> {
    return await this.droneService.deactivateDrone(body.id);
  }

  @Post('getDrones')
  async getDrones(): Promise<Drone[]> {
    return await this.droneService.getDrones();
  }

  @Post('updateDrones')
  async updateDrones(@Body() body: { drones: Drone[] }): Promise<boolean> {
    return await this.droneService.updateDrones(body.drones);
  }

  @Post('addDroneRoute')
  async addDroneRoute(@Body() body): Promise<boolean> {
    return await this.droneService.addDroneRoute(body.id, body.points);
  }

  @Post('updateDroneRoute')
  async updateDroneRoute(@Body() body): Promise<boolean> {
    return await this.droneService.updateDroneRoute(
      body.id,
      body.points,
      body.percent,
    );
  }

  @Post('deactivateDroneRoute')
  async deactivateDroneRoute(@Body() body): Promise<boolean> {
    return await this.droneService.deactivateDroneRoute(body.id);
  }

  @Post('getDroneRoutes')
  async getDroneRoutes(): Promise<DroneRoute[]> {
    return await this.droneService.getDroneRoutes();
  }
}

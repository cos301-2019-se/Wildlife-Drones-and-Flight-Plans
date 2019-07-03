import { Controller, Get, Query } from '@nestjs/common';
import { DroneService } from '../services/drone.service';

@Controller()
export class DroneController {
  constructor(private readonly droneService: DroneService) {}

  //add drone info to drone table in database
  @Get('addDrone')
  async addDrone(
    @Query('name') name: string,
    @Query('avgSpeed') avgSpeed: number,
    @Query('avgFlightTime') avgFlightTime: number,
    @Query('speed') speed: number,
    @Query('flightTime') flightTime: number,
    @Query('long') long: number,
    @Query('lat') lat: number,
  ): Promise<boolean> {
    return this.droneService.addDrone(
      name,
      avgSpeed,
      avgFlightTime,
      speed,
      flightTime,
      long,
      lat,
    );
  }

  //update drone info in table
  @Get('updateDrone')
  async updateDrone(
    @Query('id') id: number,
    @Query('name') name: string,
    @Query('avgSpeed') avgSpeed: number,
    @Query('avgFlightSpeed') avgFlightSpeed: number,
    @Query('speed') speed: number,
    @Query('flightTime') flightTime: number,
    @Query('long') long: number,
    @Query('lat') lat: number,
  ): Promise<boolean> {
    return this.droneService.updateInfo(
      id,
      name,
      avgSpeed,
      avgFlightSpeed,
      speed,
      flightTime,
      long,
      lat,
    );
  }

  //deactivate drone in table
  @Get('deactivateDrone')
  async deactivateDrone(@Query('id') id: number): Promise<boolean> {
    return this.droneService.deactivateDrone(id);
  }
}

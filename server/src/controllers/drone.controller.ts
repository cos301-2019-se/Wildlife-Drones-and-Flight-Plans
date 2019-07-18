import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { DroneService } from '../services/drone.service';
import { Drone } from '../entity/drone.entity';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))
@Controller()
export class DroneController {
  constructor(private readonly droneService: DroneService) {}

  //add drone info to drone table in database
  // @Get('addDrone')
  // async addDrone(
  //   @Query('name') name: string,
  //   @Query('avgSpeed') avgSpeed: number,
  //   @Query('avgFlightTime') avgFlightTime: number,
  //   @Query('speed') speed: number,
  //   @Query('flightTime') flightTime: number,
  //   @Query('long') long: number,
  //   @Query('lat') lat: number,
  // ): Promise<boolean> {
  //   return this.droneService.addDrone(
  //     name,
  //     avgSpeed,
  //     avgFlightTime,
  //     speed,
  //     flightTime,
  //     long,
  //     lat,
  //   );
  // }

  @Post('addDrone')
  async addDrone(@Body() body) : Promise<boolean> {
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
  

  //update drone info in table
  // @Get('updateDrone')
  // async updateDrone(
  //   @Query('id') id: number,
  //   @Query('name') name: string,
  //   @Query('avgSpeed') avgSpeed: number,
  //   @Query('avgFlightSpeed') avgFlightSpeed: number,
  //   @Query('speed') speed: number,
  //   @Query('flightTime') flightTime: number,
  //   @Query('long') long: number,
  //   @Query('lat') lat: number,
  // ): Promise<boolean> {
  //   return this.droneService.updateInfo(
  //     id,
  //     name,
  //     avgSpeed,
  //     avgFlightSpeed,
  //     speed,
  //     flightTime,
  //     long,
  //     lat,
  //   );
  // }

  @Post('updateDrone')
  async updateDrone(@Body() body) : Promise<boolean> {
    return await this.droneService.updateInfo(
      body.id,
      body.name,
      body.avgSpeed,
      body.avgFlightSpeed,
      body.speed,
      body.flightTime,
      body.lon,
      body.lat,
    );
  }

  //deactivate drone in table
  // @Get('deactivateDrone')
  // async deactivateDrone(@Query('id') id: number): Promise<boolean> {
  //   return this.droneService.deactivateDrone(id);
  // }
  @Post('deactivateDrone')
  async deactivateDrone(@Body() body ) : Promise<boolean>{
    return await this.droneService.deactivateDrone(body.id);
  }

  @Post('getDrones')
  async getDrones(): Promise<Drone[]> {
    return await this.droneService.getDrones();
  }

  @Post('updateDrones')
  async updateDrones(@Body() body: {
    drones: Drone[];
  }): Promise<boolean> {
    return await this.droneService.updateDrones(body.drones);
  }
}

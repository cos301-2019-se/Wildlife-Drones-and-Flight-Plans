import { Controller, Get, Query, Post, Body, UseGuards } from '@nestjs/common';
import { DroneService } from '../services/drone.service';
import { Drone } from 'src/entity/drone.entity';
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

   /**
   * Add a new drone to the system
   * Returns a value of true if the function executed sucessfully
   * @param name The name of the drone 
   * @param avgSpeed The average speed at which the drone travels
   * @param avgFlightTime The average time a drone can fly 
   * @param speed The top speed a drone can fecth
   * @param lon The longtitude coordinate of the drone's location
   * @param lat The latitude coordinate  of the drone's location
   */

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


  /**
   * Updates the location of the drone 
   * Returns a value of true if the function executed sucessfully
   * @param id The identification number of the drone in the system
   * @param name The name of the drone 
   * @param avgSpeed The average speed at which the drone travels
   * @param avgFlightSpeed The average flight speed at which a drone can fly 
   * @param flightTime The amount of time the drone can fly 
   * @param speed The top speed a drone can fetch
   * @param lon The longtitude coordinate of the drone's location
   * @param lat The latitude coordinate  of the drone's location
   */

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

  /**
   *Remove a drone from the system using the drone ID
   * Returns a value of true if the function executed sucessfully
   * @param id The identification number of the drone in the system
   */

  @Post('deactivateDrone')
  async deactivateDrone(@Body() body ) : Promise<boolean>{
    return await this.droneService.deactivateDrone(body.id);
  }


  /**
   *Returns a list of all the registered drones on the system
   * Returns a value of true if the function executed sucessfully
   * @param id The identification number of the drone in the system
   */
  @Post('getDrones')
  async getDrones(): Promise<Drone[]> {
    return await this.droneService.getDrones();
  }

  /**
   *Update the features of a drone registered on the system
   * Returns a value of true if the function executed sucessfully
   * @param id The identification number of the drone in the system
   */
  @Post('updateDrones')
  async updateDrones(@Body() body: {
    drones: Drone[];
  }): Promise<boolean> {
    return await this.droneService.updateDrones(body.drones);
  }
}

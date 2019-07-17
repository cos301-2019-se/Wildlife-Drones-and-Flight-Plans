/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { Drone } from '../entity/drone.entity';

@Injectable()
export class DroneService {
  constructor(private readonly databaseService: DatabaseService) {}

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

  async addDrone(
    name: string,
    avgSpeed: number,
    avgFlightTime: number,
    speed: number,
    flightTime: number,
    lon: number,
    lat: number,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const drone = new Drone();

    try {
      drone.name = name;
      drone.avgSpeed = avgSpeed;
      drone.avgFlightTime = avgFlightTime;
      drone.speed = speed;
      drone.flightTime = flightTime;
      drone.longitude = lon;
      drone.latitude = lat;
      drone.active = true;
      // tslint:disable-next-line:no-console
      const addedDrone = await con.getRepository(Drone).save(drone);
      console.log('Saved a new drone with id: ' + drone.id);
      return addedDrone != null;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

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
  async updateInfo(
    id: number,
    name: string,
    avgSpeed: number,
    avgFlightTime: number,
    speed: number,
    flightTime: number,
    lon: number,
    lat: number,
  ): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const drone = await con.getRepository(Drone).findOne({ id: id });

    if (drone == undefined) {
      console.log('Drone ' + id + ' was not found');
      return false;
    }

    try {
      drone.name = name;
      drone.avgSpeed = avgSpeed;
      drone.avgFlightTime = avgFlightTime;
      drone.speed = speed;
      drone.flightTime = flightTime;
      drone.longitude = lon;
      drone.latitude = lat;
      // tslint:disable-next-line:no-console
      const updatedDrone = await con.getRepository(Drone).save(drone);
      console.log('Drone was updated with id: ' + drone.id);
      return updatedDrone != null;
    } catch (error) {
      console.log('Drone was not updated');
      return false;
    }
  }

  /**
   *Update the features of a drone registered on the system
   * Returns a value of true if the function executed sucessfully
   * @param id The identification number of the drone in the system
   */
  async updateDrones(drones: Drone[]): Promise<boolean> {
    const conn = await this.databaseService.getConnection();
    const repo = conn.getRepository(Drone);

    try {
      await repo.save(drones);
    } catch (err) {
      console.error(err);
      return false;
    }

    return true;
  }

  /**
   *Remove a drone from the system using the drone ID
   * Returns a value of true if the function executed sucessfully
   * @param id The identification number of the drone in the system
   */

  async deactivateDrone(id: number): Promise<boolean> {
    const con = await this.databaseService.getConnection();
    const drone = await con.getRepository(Drone).findOne({ id: id });

    if (drone == undefined) {
      console.log('Drone ' + id + ' was not found');
      return false;
    }

    try {
      drone.active = false;
      // tslint:disable-next-line:no-console
      const updatedDrone = await con.getRepository(Drone).save(drone);
      console.log('Drone was deactivated with id: ' + drone.id);
      return updatedDrone != null;
    } catch (error) {
      console.log('Drone was not deactivated');
      return false;
    }
  }

   /**
   *Returns a list of all the registered drones on the system
   * Returns a value of true if the function executed sucessfully
   * @param id The identification number of the drone in the system
   */
  async getDrones(activeOnly = true): Promise<Drone[]> {
    const conn = await this.databaseService.getConnection();
    const rep = conn.getRepository(Drone);

    if (activeOnly) {
      return await rep.find({
        where: {
          active: true,
        }
      });
    }

    return await rep.find();
  }
}

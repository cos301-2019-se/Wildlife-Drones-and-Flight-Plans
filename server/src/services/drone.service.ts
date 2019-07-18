/* tslint:disable:no-console */
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { DatabaseService } from './db.service';
import { Drone } from '../entity/drone.entity';

@Injectable()
export class DroneService {
  constructor(private readonly databaseService: DatabaseService) {}

  //add drone to Drone table in database.
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

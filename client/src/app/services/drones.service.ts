import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

export interface Drone {
  id?: number;
  name: string;
  avgFlightTime: number;
  avgSpeed: number;
  active: boolean;
}

@Injectable()
export class DronesService {
  constructor(
    private authService: AuthenticationService,
  ) {}

  async getDrones(): Promise<Drone[]> {
    return await this.authService.post('getDrones', {}) as Drone[];
  }

  async updateDrones(drones: Drone[]) {
    await this.authService.post('updateDrones', {
      drones,
    });
  }
}

@Injectable()
export class DronesMockService extends DronesService {
  private drones: Drone[] = [
    {
      id: 0,
      name: 'The first drone',
      avgFlightTime: 110,
      avgSpeed: 45,
      active: true,
    },
    {
      id: 1,
      name: 'The second drone',
      avgFlightTime: 130,
      avgSpeed: 25,
      active: true,
    },
  ];

  async updateDrones(drones: Drone[]) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    let lastId = this.drones[this.drones.length - 1].id;

    this.drones = drones.map(drone => ({
      ...drone,
      id: drone.id ? drone.id : ++lastId,
    }));
  }

  async getDrones() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.drones;
  }
}


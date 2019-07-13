import { Injectable } from '@angular/core';

export interface Drone {
  id?: number;
  name: string;
  flightTime: number;
  speed: number;
}

@Injectable()
export class DronesService {
  async getDrones(): Promise<Drone[]> {
    return [];
  }

  async updateDrones(drones: Drone[]) {
    // TODO: Update drone server side
  }
}

@Injectable()
export class DronesMockService extends DronesService {
  private drones: Drone[] = [
    {
      id: 0,
      name: 'The first drone',
      flightTime: 110,
      speed: 45,
    },
    {
      id: 1,
      name: 'The second drone',
      flightTime: 130,
      speed: 25,
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


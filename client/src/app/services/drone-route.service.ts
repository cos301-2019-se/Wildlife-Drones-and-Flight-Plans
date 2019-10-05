import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class DroneRouteService {
  constructor(
    private authService: AuthenticationService,
  ) {}
  async generateIncidentRoutes(droneId: number, coords: Coordinates): Promise<any[]> {
    const routes = await this.authService.post('drone-route/create-incident-route', {
      droneId,
      lon: coords.longitude,
      lat: coords.latitude,
    });

    console.log('got routes', routes);
    return routes as any[];
  }

  async generateHotspotRoutes(droneId: number, coords: Coordinates): Promise<any[]> {
    const routes = await this.authService.post('drone-route/create-hotspot-route', {
      droneId,
      lon: coords.longitude,
      lat: coords.latitude,
    });

    console.log('got routes', routes);
    return routes as any[];
  }

  async generatePredictiveRoutes(droneId: number, coords: Coordinates, animalIds: string[]): Promise<any> {
    const res = await this.authService.post('drone-route/create-animal-prediction-route', {
      droneId,
      lon: coords.longitude,
      lat: coords.latitude,
      animalIds,
    });

    console.log('got routes', res);

    return res;
  }

  async selectDroneRoute(droneId: number, points: any[]) {
    return await this.authService.post('selectDroneRoute', {
      points,
      droneId,
    });
  }

  /**
   * Get all animal IDs for planning predictive route
   */
  async getAnimalIds(): Promise<string[]> {
    return await this.authService.post('getAnimalIds', {}) as string[];
  }

  async getPastRoutes() {
    return await this.authService.post('getDroneRoutes', {}) as any[];
  }
}

@Injectable()
export class DroneRouteMockService extends DroneRouteService {
  async generateIncidentRoutes(droneId: number, coords: Coordinates): Promise<Array<[number, number]>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // artificial delay
    return [
      [
        31.443901062011715,
        -25.42746233796561
      ],
      [
        31.456089019775387,
        -25.43443859718213
      ],
      [
        31.458492279052734,
        -25.44513474341807
      ],
      [
        31.475830078124996,
        -25.457999863527526
      ],
      [
        31.480979919433594,
        -25.44745986690235
      ],
      [
        31.483726501464847,
        -25.40978734065011
      ],
      [
        31.466217041015625,
        -25.425756968727935
      ],
      [
        31.456775665283203,
        -25.40870194936565
      ],
      [
        31.43360137939453,
        -25.41614443630343
      ],
      [
        31.43840789794922,
        -25.435988822155203
      ],
      [
        31.44287109375,
        -25.4277724025071
      ]
    ];
  }
}

import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class DroneRouteService {
  constructor(
    private authService: AuthenticationService,
  ) {}

  async generateRoute(droneId: number, coords: Coordinates): Promise<Array<[number, number]>> {
    // TODO: fetch generated route from the server
    return [];
  }
}

@Injectable()
export class DroneRouteMockService extends DroneRouteService {
  async generateRoute(droneId: number, coords: Coordinates): Promise<Array<[number, number]>> {
    await new Promise(resolve => setTimeout(resolve, 500)); // artificial delay
    return [
      [
        28.265161514282227,
        -25.876909349907436
      ],
      [
        28.270568847656246,
        -25.88486323300488
      ],
      [
        28.28258514404297,
        -25.88833806231499
      ],
      [
        28.29279899597168,
        -25.88470879377305
      ],
      [
        28.2952880859375,
        -25.877527146422874
      ],
      [
        28.284645080566406,
        -25.86941831005656
      ],
      [
        28.294343948364258,
        -25.86246743592744
      ],
      [
        28.27958106994629,
        -25.857987767091533
      ],
      [
        28.2721996307373,
        -25.873897545622118
      ],
      [
        28.265504837036133,
        -25.87598264907556
      ]
    ];
  }
}

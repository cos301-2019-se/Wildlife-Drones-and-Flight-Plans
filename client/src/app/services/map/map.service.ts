import { Injectable } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(
    private authService: AuthenticationService,
  ) { }

  public async getMap() {
    return await this.authService.post(`map/reserve`, {});
  }

  public async findReserves(top, left, bottom, right) {
    const res = await this.authService.post(`map/find-reserves`, {
      top,
      left,
      bottom,
      right,
    });

    return res as any;
  }

  /**
   * Tell the server to update the map for the given reserve name
   * @param name The name of the reserve (unique name from OSM)
   */
  public async updateMap(name: string) {
    await this.authService.post(`map/update`, {
      name
    });
  }
}

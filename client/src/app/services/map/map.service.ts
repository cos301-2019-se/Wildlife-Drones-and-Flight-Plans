import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LatLngExpression } from 'leaflet';
import { Storage } from '@ionic/storage';
import { AuthenticationService } from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map;
  private center: LatLngExpression = [-25.8974, 28.2906];

  constructor(
    private authService: AuthenticationService,
    private storage: Storage,
  ) { }

  public getCenter(): LatLngExpression {
    return this.center;
  }

  public async findReserves(top, left, bottom, right) {
    const res = await this.authService.post(`map/find-reserves`, {
      top,
      left,
      bottom,
      right,
    });


    this.center = [(top + bottom) / 2, (left + right) / 2];
    console.log(await this.storage.get('accessToken'));

    return res as any;
  }

  public async updateMap(name: string) {
    const map = await this.authService.post(`map/update`, {
      name
    });

    this.map = map;
    return map;
  }

  public async getMap() {
    return this.map;
  }
}

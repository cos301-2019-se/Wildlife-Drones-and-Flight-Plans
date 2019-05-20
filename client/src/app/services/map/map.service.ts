import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LatLngExpression } from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map;
  private center: LatLngExpression = [-25.8974, 28.2906];

  constructor(
    private http: HttpClient,
  ) { }

  public getCenter(): LatLngExpression {
    return this.center;
  }

  public async findReserves(top, left, bottom, right) {
    const res = await this.http.post(`http://localhost:3000/map/find-reserves`, {
      top,
      left,
      bottom,
      right
    }).toPromise();

    this.center = [(top + bottom) / 2, (left + right) / 2];

    return res as any;
  }

  public async updateMap(name: string) {
    const map = await this.http.post(`http://localhost:3000/map/update`, {
      name
    }).toPromise();

    this.map = map;
    return map;
  }

  public async getMap() {
    return this.map;
  }
}

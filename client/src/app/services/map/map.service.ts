import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LatLngExpression } from 'leaflet';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map;
  private center: LatLngExpression = [-25.8974, 28.2906];

  constructor(
    private http: HttpClient,
    private storage: Storage,
  ) { }

  public getCenter(): LatLngExpression {
    return this.center;
  }

  public async updateMap(left, bottom, right, top) {
    const map = await this.http.post(`http://localhost:3000/map/update`, {
      left,
      bottom,
      right,
      top,
    },{headers :{ 'Authorization': 'Bearer ' + await this.storage.get('accessToken')}
  

}).toPromise();

    this.map = map;
    this.center = [(top + bottom) / 2, (left + right) / 2];
    console.log(await this.storage.get('accessToken'));
    return map;
  }

  public async getMap() {
    return this.map;
  }
}

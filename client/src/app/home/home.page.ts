import { Component, ViewChild } from '@angular/core';
import { MapOptions, ControlOptions, tileLayer, geoJSON, Map } from 'leaflet';
import { LeafletDirective } from '@asymmetrik/ngx-leaflet';
import { MapService } from '../services/map/map.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private map: Map;

  @ViewChild('leaflet') leaflet : LeafletDirective;

  constructor(
    private mapService: MapService,
  ) {}

  mapOptions: MapOptions = {
    layers: [
      tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: null
      })
    ],
    zoom: 13,
    center: [-25.8974, 28.2906]
  };

  async mapReady(map: Map) {
    this.map = map;

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    const mapData = await this.mapService.getMap();

    geoJSON(mapData.reserve as any, {
      style: feature => {
        return {
          color: 'red',
          weight: 1,
          fillColor: 'transparent'
        };
      }
    }).addTo(map);

    mapData.roads.forEach(road => geoJSON(road as any, {
      style: feature => {
        return {
          weight: 1,
          color: 'orange'
        };
      }
    }).addTo(map));

    mapData.dams.forEach(dam => geoJSON(dam as any, {
      style: feature => {
        return {
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 1
        };
      }
    }).addTo(map));
  }
}

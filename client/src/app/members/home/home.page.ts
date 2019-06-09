import { Component, ViewChild } from '@angular/core';
import { MapOptions, tileLayer, geoJSON, Map } from 'leaflet';
import { LeafletDirective } from '@asymmetrik/ngx-leaflet';
import { MapService } from '../../services/map/map.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  private map: Map;
  @ViewChild('leaflet') leaflet: LeafletDirective;

  constructor(
    private mapService: MapService,
    private authService: AuthenticationService,
  ) {}

  mapOptions: MapOptions = {
    zoomSnap: 0.3,
    zoomAnimation: true,
    fadeAnimation: true,
    worldCopyJump: true,
    layers: [
      tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 18,
        attribution: 'Google Earth',
        detectRetina: true,
      })
    ],
    zoom: 13,
    center: this.mapService.getCenter()
  };

  async mapReady(map: Map) {
    this.map = map;

    this.map.zoomControl.setPosition('bottomright');

    setTimeout(() => {
      this.map.invalidateSize();
    }, 500);

    const mapData = await this.mapService.getMap();
    if (!mapData.reserve) {
      return;
    }

    console.log(mapData);

    // render reserve
    geoJSON(mapData.reserve as any, {
      style: feature => {
        return {
          color: 'red',
          weight: 1,
          fillColor: 'transparent'
        };
      }
    }).addTo(map);
  }

  setMarkerAddingState() {

  }

}


interface MapState {}

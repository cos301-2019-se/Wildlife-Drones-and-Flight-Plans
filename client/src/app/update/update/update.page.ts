import { Component, OnInit } from '@angular/core';
import { MapOptions, Map, Draw, Control, tileLayer, FeatureGroup } from 'leaflet';
import { MapService } from '../../services/map/map.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})
export class UpdatePage implements OnInit {

  private map: Map;
  private boxLayer = new FeatureGroup();

  mapOptions: MapOptions = {
    layers: [
      tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: null
      })
    ],
    zoom: 13,
    center: [-25.8974, 28.2906]
  };

  constructor(
    private mapService: MapService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  async mapReady(map: Map) {
    this.map = map;

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    map.addLayer(this.boxLayer);
    const drawControl = new Control.Draw({
      position: 'bottomleft',
      edit: {
        featureGroup: this.boxLayer,
        remove: false,
      },
      draw: {
        marker: false,
        circlemarker: false,
        polyline: false,
        rectangle: false,
        circle: false,
        polygon: false,
      }
    });

    map.on(Draw.Event.CREATED, async e => {
      const layer = (e as any).layer;

      const bounds = layer._bounds;
      const left = bounds._southWest.lng;
      const bottom = bounds._southWest.lat;
      const right = bounds._northEast.lng;
      const top = bounds._northEast.lat;

      this.boxLayer.addLayer(layer);
      const map = await this.mapService.updateMap(left, bottom, right, top);

      this.router.navigateByUrl('/home');

      
      console.log('map', map);
    });

    map.addControl(drawControl);
  }

  startDrawing() {
    new Draw.Rectangle(this.map).enable();
  }

}

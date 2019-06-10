import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import * as ol from 'ol';
import * as proj4 from 'proj4';
import { fromLonLat } from 'ol/proj';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorLayer } from 'ol/layer';
import { ZoomSlider } from 'ol/control';

import { MapService } from '../../services/map/map.service';
import { AuthenticationService } from '../../services/authentication.service';
import VectorSource from 'ol/source/Vector';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  private map: Map;

  constructor(
    private mapService: MapService,
    private authService: AuthenticationService,
  ) {}

  async ngOnInit() {
    const mapEl = this.mapElement.nativeElement;
    this.map = new Map({
      target: mapEl,
      loadTilesWhileInteracting: true,
      loadTilesWhileAnimating: true,
      layers: [
        new TileLayer({
          preload: Infinity,
          source: new XYZ({
            url: 'https://mt{0-3}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
          })
        })
      ],
      view: new View({
        center: fromLonLat(this.mapService.getCenter().reverse()),
        zoom: 13,
      })
    });

    this.map.addControl(new ZoomSlider());

    const mapData = await this.mapService.getMap();

    console.log('mapData', mapData);

    const reserve = new GeoJSON().readFeature(mapData.reserve, {
      featureProjection: 'EPSG:3857',
    });

    this.map.addLayer(new VectorLayer({
      source: new VectorSource({
        features: [reserve],
      }),
    }));
  }

  // async mapReady(map: Map) {
  //   this.map = map;

  //   this.map.zoomControl.setPosition('bottomright');

  //   setTimeout(() => {
  //     this.map.invalidateSize();
  //   }, 500);

  //   const mapData = await this.mapService.getMap();
  //   if (!mapData.reserve) {
  //     return;
  //   }

  //   console.log(mapData);
  // }
}

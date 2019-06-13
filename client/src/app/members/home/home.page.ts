import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { fromLonLat, transformExtent } from 'ol/proj';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorLayer } from 'ol/layer';
import { ZoomSlider } from 'ol/control';
import bbox from '@turf/bbox';

import { MapService } from '../../services/map/map.service';
import { AuthenticationService } from '../../services/authentication.service';
import VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

import { trigger, style, animate, transition, group, query, animateChild } from '@angular/animations';

interface MapState {
  confirmations?: {
    cancel: () => void;
    done: () => void;
  };
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  animations: [
    trigger('button-animation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(0.5)',
        }),
        group([
          animate('200ms ease-out', style({
            opacity: 1,
            transform: 'scale(1)',
          }))
        ]),
      ]),
      transition(':leave', [
        group([
          animate('200ms ease-out', style({
            opacity: 0,
            transform: 'scale(0.5)',
          })),
        ]),
      ]),
    ]),
    trigger('place-marker-animation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-140px)',
        }),
        group([
          animate('300ms ease-in', style({
            opacity: 1,
            transform: 'translateY(0)',
          })),
        ]),
      ]),
      transition(':leave', [
        group([
          animate('300ms ease-in', style({
            opacity: 0,
            transform: 'scale(0)',
          })),
        ]),
      ]),
    ]),
  ],
})
export class HomePage implements OnInit {
  @ViewChild('map') mapElement: ElementRef;
  private map: Map;

  states: {[stateName: string]: MapState} = {
    default: {},
    addMarker: {
      confirmations: {
        cancel: () => this.state = this.states.default,
        done: () => {
          // add the marker to the map
          this.state = this.states.default;
        }
      },
    },
    viewRoute: {},
  };

  state = this.states.default;

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
      ]
    });

    const mapData = await this.mapService.getMap();

    this.map.setView(new View({
      center: fromLonLat(this.mapService.getCenter().reverse()),
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      extent: transformExtent(bbox(mapData.reserve), 'EPSG:4326', 'EPSG:3857'), // minx miny maxx maxy
    }));

    this.map.addControl(new ZoomSlider());

    console.log('mapData', mapData);

    const reserve = new GeoJSON().readFeature(mapData.reserve, {
      featureProjection: 'EPSG:3857',
    });

    this.map.addLayer(new VectorLayer({
      source: new VectorSource({
        features: [reserve],
      }),
      style: new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 3,
        }),
        fill: null,
      }),
    }));
  }
}

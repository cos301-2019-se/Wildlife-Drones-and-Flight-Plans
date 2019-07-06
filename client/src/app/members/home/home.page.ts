import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';

import { fromLonLat, transformExtent, toLonLat } from 'ol/proj';
import Map from 'ol/Map';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorLayer, Tile as TileLayer } from 'ol/layer';
import { ZoomSlider } from 'ol/control';
import VectorSource from 'ol/source/Vector';

import bbox from '@turf/bbox';
import contains from '@turf/boolean-contains';
import { point } from '@turf/helpers';
import flatten from '@turf/flatten';
import mask from '@turf/mask';

import { MapService } from '../../services/map/map.service';
import { AuthenticationService } from '../../services/authentication.service';

import { trigger, style, animate, transition, group } from '@angular/animations';
import { GeoJsonVectorTileSource } from '../../services/map/geojsonvt';
import VectorTileLayer from 'ol/layer/VectorTile';
import GeometryType from 'ol/geom/GeometryType';

import { GeolocationService } from '../../services/geolocation.service';
import { Subscription } from 'rxjs';
import { Fill, Stroke, Style } from 'ol/style';
import { Feature } from 'ol';
import Circle from 'ol/geom/Circle';
import { METERS_PER_UNIT } from 'ol/proj/Units';
import CircleStyle from 'ol/style/Circle';
import Point from 'ol/geom/Point';

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
    trigger('tooltip-animation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-50px)',
        }),
        group([
          animate('600ms ease-in', style({
            opacity: 1,
            transform: 'translateY(0)',
          })),
        ])
      ]),
      transition(':leave', [
        group([
          animate('600ms ease-out', style({
            opacity: 0,
            transform: 'translateY(-50px)',
          })),
        ])
      ]),
    ])
  ],
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('map') mapElement: ElementRef;
  private map: Map;

  private geolocationSubscription: Subscription;
  public coordinates: Coordinates;
  public followingGeolocation = true;

  public withinReserve = true;

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
    private geolocationService: GeolocationService
  ) {}

  ngOnDestroy() {
    if (this.geolocationSubscription) {
      this.geolocationSubscription.unsubscribe();
    }
  }

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
    console.log(mapData);

    const MAX_ZOOM = 18;
    const MIN_ZOOM = 11;

    this.map.setView(new View({
      center: fromLonLat(this.mapService.getCenter().reverse()),
      enableRotation: false,
      zoom: 13,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      extent: transformExtent(bbox(mapData.reserve), 'EPSG:4326', 'EPSG:3857'), // minx miny maxx maxy
    }));

    // create chorograph of dams
    const max = mapData.grid.reduce((m, cell) => m = cell.properties.distances.dams > m ? cell.properties.distances.dams : m, -Infinity);
    mapData.grid.forEach(cell => cell.properties.distances.dams = Math.pow(1 - cell.properties.distances.dams / max, 2));

    this.map.addLayer(new VectorLayer({
      source: new VectorSource({
        features: new GeoJSON().readFeatures({
          type: 'FeatureCollection',
          features: mapData.grid
        }, {
          featureProjection: 'EPSG:3857',
        }),
      }),
      updateWhileAnimating: false,
      updateWhileInteracting: false,
      // preload: Infinity,
      renderMode: 'image',
      style: cell => {
        return new Style({
          stroke: new Stroke({
            color: 'white'
          }),
          fill: new Fill({
            color: [255, 0, 0, cell.getProperties().distances.dams * 0.8]
          }),
        });
      },
    }));

    this.map.addControl(new ZoomSlider());

    console.log('mapData', mapData);

    // add the reserve's inverse mask to reduce visibility of outside of reserve
    const reserve = new GeoJSON().readFeature(mask(mapData.reserve), {
      featureProjection: 'EPSG:3857',
    });

    this.map.addLayer(new VectorLayer({
      source: new VectorSource({
        features: [reserve],
      }),
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      style: new Style({
        fill: new Fill({
          color: [255, 255, 255, 0.6],
        }),
      }),
    }));

    // check whether the centre of the map is within map bounds whenever it changes
    const flattenedReserve = flatten(mapData.reserve);
    this.map.on('rendercomplete', () => {
      const center = toLonLat(this.map.getView().getCenter());

      this.withinReserve = flattenedReserve.features.some(
        geom => contains(geom, point(center))
      );
    });

    this.geolocationListen();
  }

  /**
   * Listens to the geolocation provider and alters the map
   * on update: draws the geolocation and accuracy, and moves
   * the map if following geolocation
   */
  geolocationListen() {
    console.log('listening to geolocation');
    const accuracyFeature = new Feature();
    accuracyFeature.setStyle(new Style({
      fill: new Fill({
        color: [255, 255, 255, 0.2],
      }),
      stroke: new Stroke({
        color: [255, 255, 255, 1],
      }),
    }));

    const positionFeature = new Feature();
    positionFeature.setStyle(new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: '#39c',
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
      }),
    }));

    const geoVectorSource = new VectorSource();
    geoVectorSource.addFeature(accuracyFeature);
    geoVectorSource.addFeature(positionFeature);

    this.map.addLayer(new VectorLayer({
      source: geoVectorSource,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    }));

    this.geolocationSubscription = this.geolocationService.subscribe((coords) => {
      console.log('got geolocation', coords);
      this.coordinates = coords;
      const point = fromLonLat([coords.longitude, coords.latitude]);

      accuracyFeature.setGeometry(
        new Circle(point, METERS_PER_UNIT.m * coords.accuracy)
      );

      positionFeature.setGeometry(coords ? new Point(point) : null);

      if (this.followingGeolocation) {
        this.goToGeolocation();
      }
    });

    this.map.on('pointerdrag', () => {
      this.followingGeolocation = false;
    });
  }

  /**
   * Animates to the latest polled geolocation
   * Sets following geolocation to true
   */
  goToGeolocation() {
    this.followingGeolocation = true;
    const view = this.map.getView();
    view.animate({
      center: fromLonLat([this.coordinates.longitude, this.coordinates.latitude]),
      duration: 1000,
    });
  }
}

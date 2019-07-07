import { Component, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

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

import { GeolocationService } from '../../services/geolocation.service';
import { Subscription } from 'rxjs';
import { Fill, Stroke, Style } from 'ol/style';
import { Feature } from 'ol';
import Circle from 'ol/geom/Circle';
import { METERS_PER_UNIT } from 'ol/proj/Units';
import CircleStyle from 'ol/style/Circle';
import Point from 'ol/geom/Point';
import { animations } from './home.page.animations';
import { DroneRouteService } from '../../services/drone-route.service';
import LineString from 'ol/geom/LineString';
import { modulo } from 'ol/math';

interface MapState {
  setup?: () => Promise<any>;
  destruct?: () => Promise<any>;
  confirmations?: {
    add?: () => void;
    cancel?: () => void;
    done: () => void;
  };
  tooltip?: string;
  data?: {
    [s: string]: any;
  };
  [s: string]: any;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  animations,
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('map') mapElement: ElementRef;
  private map: Map;

  private geolocationSubscription: Subscription;
  public coordinates: Coordinates;
  public followingGeolocation = true;

  public withinReserve = true;

  readonly states = {
    // Default state
    default: {},
    // Add marker state
    addMarker: {
      tooltip: 'Pan the map to move the marker',
      confirmations: {
        cancel: () => this.setState(this.states.default),
        done: () => {
          // TODO: add the marker to the map via the server
          this.setState(this.states.default);
        }
      },
    },
    // Set up route state
    setUpRoute: {
      setup: async () => {
        await new Promise(resolve => {
          // TODO: Fetch actual drones' data from server
          setTimeout(() => {
            this.states.setUpRoute.data.drones = [
              {
                id: 0,
                name: 'The first drone',
                flightTime: 110,
                speed: 45,
              },
              {
                id: 1,
                name: 'The second drone',
                flightTime: 130,
                speed: 25,
              },
            ];
            // set the first drone in the list as the active drone
            this.states.setUpRoute.data.selectedDrone = this.states.setUpRoute.data.drones[0];
            console.log(this.states.setUpRoute);
            resolve();
          }, 50);
        });
      },
      tooltip: 'Configure drone flight options',
      confirmations: {
        cancel: () => this.setState(this.states.default),
        done: () => {
          // TODO: Get the flight route
          this.setState(this.states.viewRoute);
        },
        add: () => {
          // TODO: Add a new drone to the list
          this.states.setUpRoute.data.drones.unshift({
            id: 9,
            name: '',
            flightTime: 120,
            speed: 40,
          });
          this.states.setUpRoute.data.selectedDrone = this.states.setUpRoute.data.drones[0];
        },
      },
      data: {
        selectedDrone: null,
        drones: [],
      },
    },
    // View route state
    viewRoute: {
      setup: async () => {
        console.log('view route setup');
        const startingCoords = this.coordinates;
        const drone = this.states.setUpRoute.data.selectedDrone;

        const route = await this.droneRouteService.generateRoute(drone.id, startingCoords);

        console.log('route', route);

        // line style
        const lineStyle = new Style({
          stroke: new Stroke({
            color: '#39c',
            width: 5,
          }),
        });
        // an path inner style
        const dashStyle = new Style({
          stroke: new Stroke({
            color: '#fff',
            width: 5,
            lineDash: [4, 10],
          }),
        });

        const vector = new VectorSource({
          features: [
            new Feature(new LineString(route).transform('EPSG:4326', 'EPSG:3857')),
          ],
        });

        this.states.viewRoute.data.routeLayer = new VectorLayer({
          source: vector,
          style: [
            lineStyle,
            dashStyle,
          ],
        });

        const stroke = dashStyle.getStroke();
        const dash = stroke.getLineDash();
        let length = dash.reduce((a, b) => a + b, 0);
        length = dash.length % 2 === 1 ? length * 2 : length;

        const update = () => {
          const offset = stroke.getLineDashOffset() || 0;
          stroke.setLineDashOffset(modulo(offset + 0.25, length));
          vector.refresh();

          if (this.states.viewRoute.data.antPathUpdate) {
            requestAnimationFrame(update);
          }
        };

        update();

        this.map.addLayer(this.states.viewRoute.data.routeLayer);
      },
      tooltip: 'Viewing route',
      confirmations: {
        done: async () => {
          // TODO: tell the server that the drone is no longer en route
          this.setState(this.states.default);
        },
      },
      data: {
        routeLayer: null,
        antPathUpdate: true,
      },
      destruct: async () => {
        // remove the map layer from the map
        this.states.viewRoute.data.antPathUpdate = false;
        this.map.removeLayer(this.states.viewRoute.data.routeLayer);
        // encourage garbage collection on the layer data
        this.states.viewRoute.data.routeLayer = null;
        // track to the current user's location
        this.goToGeolocation();
      },
    },
  };

  state: MapState = this.states.default;

  constructor(
    private mapService: MapService,
    private authService: AuthenticationService,
    private geolocationService: GeolocationService,
    private cdr: ChangeDetectorRef,
    private droneRouteService: DroneRouteService
  ) {}

  async ngOnDestroy() {
    if (this.geolocationSubscription) {
      this.geolocationSubscription.unsubscribe();
    }

    if (!!this.state.destruct) {
      await this.state.destruct();
    }
  }

  ngOnInit() {
    this.initialiseMap();
  }

  /**
   * Sets the map state to a new state.
   * Performs necessary functions to prepare state.
   * @param state The new state
   */
  async setState(state: MapState) {
    console.log('setting state to', state);
    // destruct the current state
    if (!!this.state.destruct) {
      console.log('destructing state');
      await this.state.destruct();
    }

    // set up the new state
    if (!!state.setup) {
      console.log('setting up state');
      await state.setup();
    }

    // finally set the state as the new state once set up
    this.state = state;
  }

  async initialiseMap() {
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

    this.map.addControl(new ZoomSlider());


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
    const accuracyFeature = new Feature();
    accuracyFeature.setStyle(new Style({
      fill: new Fill({
        color: [51, 153, 204, 0.2],
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
      this.coordinates = coords;
      const coord = fromLonLat([coords.longitude, coords.latitude]);

      accuracyFeature.setGeometry(
        new Circle(coord, METERS_PER_UNIT.m * coords.accuracy)
      );

      positionFeature.setGeometry(coords ? new Point(coord) : null);

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

  refresh() {
    this.cdr.detectChanges();
  }
}

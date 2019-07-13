import { Component, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, HostListener } from '@angular/core';

import { fromLonLat, transformExtent, toLonLat } from 'ol/proj';
import Map from 'ol/Map';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorLayer, Tile as TileLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';

import bbox from '@turf/bbox';
import contains from '@turf/boolean-contains';
import { point } from '@turf/helpers';
import flatten from '@turf/flatten';
import mask from '@turf/mask';

import { MapService } from '../../services/map/map.service';

import { GeolocationService } from '../../services/geolocation.service';
import { Subscription } from 'rxjs';
import { Fill, Stroke, Style, Icon } from 'ol/style';
import { Feature } from 'ol';
import Circle from 'ol/geom/Circle';
import { METERS_PER_UNIT } from 'ol/proj/Units';
import CircleStyle from 'ol/style/Circle';
import Point from 'ol/geom/Point';
import { animations } from './home.page.animations';
import { DroneRouteService } from '../../services/drone-route.service';
import LineString from 'ol/geom/LineString';
import { modulo } from 'ol/math';
import center from '@turf/center';
import { IncidentsService } from '../../services/incidents.service';
import { DronesService } from 'src/app/services/drones.service';
import { Drone } from '../../services/drones.service';

interface MapState {
  setup?: (self: MapState) => Promise<any>;
  destruct?: (self: MapState) => Promise<any>;
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
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('map') mapElement: ElementRef;
  private map: Map;

  private geolocationSubscription: Subscription;
  public coordinates: Coordinates;
  public isFollowingGeolocation = false;

  incidentsLayer = null;
  private incidentsPoller = null;

  public withinReserve = true;

  readonly states = {
    // Default state
    default: {},
    // Add marker state
    addMarker: {
      tooltip: 'Pan the map to change incident location',
      confirmations: {
        cancel: () => this.setState(this.states.default),
        done: () => {
          this.states.addMarker.data.markerPosition = toLonLat(this.map.getView().getCenter());
          // TODO: add the marker to the map via the server
          this.setState(this.states.addMarkerDetails);
        }
      },
      data: {
        markerPosition: null,
      },
    },
    // Add marker details state (after add marker)
    addMarkerDetails: {
      tooltip: 'Set incident information',
      setup: async self => {
        self.data.incidentTypes = await this.incidentsService.getIncidentTypes();
        self.data.typeId = self.data.incidentTypes[0].id;
      },
      confirmations: {
        cancel: () => {
          this.setState(this.states.addMarker);
        },
        done: () => {
          const { typeId, description } = this.states.addMarkerDetails.data;
          const [lon, lat] = this.states.addMarker.data.markerPosition;
          this.incidentsService.addIncident(typeId, description, lon, lat).then(() => {
            this.getIncidents();
          });
          this.setState(this.states.default);
        }
      },
      data: {
        incidentTypes: [],
        typeId: null,
        description: '',
      },
    },
    // Set up route state
    setUpRoute: {
      setup: async (self) => {
        self.data.drones = await this.dronesService.getDrones();
        // set the first drone in the list as the active drone
        self.data.selectedDrone = self.data.drones[0];
      },
      tooltip: 'Configure drone flight options',
      confirmations: {
        cancel: () => this.setState(this.states.default),
        done: () => {
          this.dronesService.updateDrones(this.states.setUpRoute.data.drones);
          // TODO: Get the flight route
          this.setState(this.states.viewRoute);
        },
        add: async () => {
          // TODO: Add a new drone to the list
          const newDrone: Drone = {
            name: 'New Drone',
            speed: 30,
            flightTime: 100,
          };
          this.states.setUpRoute.data.drones.push(newDrone);
          this.states.setUpRoute.data.selectedDrone = newDrone;
        },
      },
      data: {
        selectedDrone: null,
        drones: [],
      },
    },
    // View route state
    viewRoute: {
      setup: async (self) => {
        self.data.antPathUpdate = true;
        const startingCoords = this.coordinates;
        const drone = this.states.setUpRoute.data.selectedDrone;

        const route = await this.droneRouteService.generateRoute(drone.id, startingCoords);

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

        self.data.routeLayer = new VectorLayer({
          source: vector,
          style: [
            lineStyle,
            dashStyle,
          ],
          updateWhileAnimating: true,
          updateWhileInteracting: true,
        });

        const stroke = dashStyle.getStroke();
        const dash = stroke.getLineDash();
        let length = dash.reduce((a, b) => a + b, 0);
        length = dash.length % 2 === 1 ? length * 2 : length;

        const update = () => {
          const offset = stroke.getLineDashOffset() || 0;
          stroke.setLineDashOffset(modulo(offset + 0.25, length));
          vector.refresh();

          if (self.data.antPathUpdate) {
            requestAnimationFrame(update);
          }
        };

        update();

        this.map.addLayer(self.data.routeLayer);
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
    private geolocationService: GeolocationService,
    private cdr: ChangeDetectorRef,
    private droneRouteService: DroneRouteService,
    private incidentsService: IncidentsService,
    private dronesService: DronesService,
  ) {}

  async ngOnDestroy() {
    if (this.geolocationSubscription) {
      this.geolocationSubscription.unsubscribe();
    }

    if (!!this.state.destruct) {
      await this.state.destruct(this.state);
    }

    if (!!this.incidentsPoller) {
      clearInterval(this.incidentsPoller);
    }
  }

  ngAfterViewInit() {
    this.initialiseMap();

    // get incidents every minute
    this.incidentsPoller = setInterval(() => {
      this.getIncidents();
    }, 60000);
  }

  /**
   * Sets the map state to a new state.
   * Performs necessary functions to prepare state.
   * @param state The new state
   */
  async setState(state: MapState) {
    // destruct the current state
    if (!!this.state.destruct) {
      await this.state.destruct(this.state);
    }

    // set up the new state
    if (!!state.setup) {
      await state.setup(state);
    }

    // finally set the state as the new state once set up
    this.state = state;
  }

  async initialiseMap() {
    await new Promise(resolve => setTimeout(resolve, 0));
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
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([22.9375, -30.5595]), // south africa
        zoom: 4,
        enableRotation: false,
        maxZoom: 4,
        minZoom: 4,
      }),
    });

    this.geolocationListen();
    this.getIncidents();

    // get the reserve data
    const mapData: any = await this.mapService.getMap();
    const reserveShape = mapData.reserve;

    // draw the reserve
    this.drawReserve(mapData.reserve);

    // animate zoom to the reserve
    const MAX_ZOOM = 18;
    const MIN_ZOOM = 11;

    const view = this.map.getView();
    view.setMaxZoom(MAX_ZOOM);

    // set centre coordinates if geolocation hasn't been found yet
    if (!this.coordinates) {
      const reserveCenter = center(reserveShape).geometry.coordinates;

      this.coordinates = {
        longitude: reserveCenter[0],
        latitude: reserveCenter[1],
        accuracy: 10000,
        altitude: undefined,
        altitudeAccuracy: undefined,
        heading: undefined,
        speed: undefined,
      };
    }

    const coordsCenter = fromLonLat([this.coordinates.longitude, this.coordinates.latitude]);

    view.animate({
      center: coordsCenter,
      zoom: 13,
      duration: 1000,
    }, () => {
      this.map.setView(new View({
        center: coordsCenter,
        enableRotation: false,
        zoom: 13,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        extent: transformExtent(bbox(reserveShape), 'EPSG:4326', 'EPSG:3857'),
      }));

      this.isFollowingGeolocation = true;
    });
  }

  /**
   * Draws an inverted polygon to grey out areas outside the reserve
   * @param reserveShape 
   */
  private drawReserve(reserveShape) {
    // add the reserve's inverse mask to reduce visibility of outside of reserve
    const reserve = new GeoJSON().readFeature(mask(reserveShape), {
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
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        })
      }),
    }));

    // check whether the centre of the map is within map bounds whenever it changes
    const flattenedReserve = flatten(reserveShape);
    this.map.on('rendercomplete', () => {
      const center = toLonLat(this.map.getView().getCenter());

      this.withinReserve = flattenedReserve.features.some(
        geom => contains(geom, point(center))
      );
    });
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

      if (this.isFollowingGeolocation) {
        this.goToGeolocation();
      }
    });

    this.map.on('pointerdrag', () => {
      this.isFollowingGeolocation = false;
    });
  }

  /**
   * Animates to the latest polled geolocation
   * Sets following geolocation to true
   */
  goToGeolocation() {
    this.isFollowingGeolocation = true;
    if (!this.coordinates) {
      // coordinates not found, will update location once found
      return;
    }

    const view = this.map.getView();
    view.animate({
      center: fromLonLat([this.coordinates.longitude, this.coordinates.latitude]),
      duration: 1000,
    });
  }

  /**
   * Updates the incidents layer to show incident markers
   */
  async getIncidents() {
    const incidents = await this.incidentsService.getIncidents();

    const layer = new VectorLayer({
      source: new VectorSource({
        features: incidents.map(incident => new Feature({
          geometry: new Point(fromLonLat([incident.longitude, incident.latitude])),
        })),
      }),
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: 'red',
          }),
        }),
      }),
    });

    if (this.incidentsLayer) {
      this.map.removeLayer(this.incidentsLayer);
    }

    this.incidentsLayer = layer;
    this.map.addLayer(this.incidentsLayer);
  }

  refresh() {
    this.cdr.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onPageResize(event) {
    this.map.updateSize();
  }
}

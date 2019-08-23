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
import { point, lineString } from '@turf/helpers';
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
import { DronesService } from '../../services/drones.service';
import { Drone } from '../../services/drones.service';
import { LoadingController, AlertController } from '@ionic/angular';

interface MapState {
  setup?: (self: MapState) => Promise<any>;
  destruct?: (self: MapState) => Promise<any>;
  confirmations?: {
    add?: (state: MapState) => void;
    cancel?: (state: MapState) => void;
    done: (state: MapState) => void;
    next?: (state: MapState) => void;
    prev?: (state: MapState) => void;
  };
  tooltip?: string;
  data?: {
    [s: string]: any;
  };
  [s: string]: any;
  isAtEnd?: (state: MapState) => boolean;
  isAtStart?: (state: MapState) => boolean;
}

enum FlightTypes {
  ANIMAL = 'Visit animals',
  INCIDENT = 'Latest incidents',
  HOTSPOTS = 'Hotspots'
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
  private mapUpdateInterval;

  private geolocationSubscription: Subscription;
  public coordinates: Coordinates;
  public isFollowingGeolocation = false;

  incidentsLayer = null;
  private incidentsPoller = null;

  poachingHeatmapLayer = null;
  animalHeatmapLayer = null;
  private timePoller = null;

  public withinReserve = true;

  public flightTypesEnum = FlightTypes;

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
        self.getIncidentTypes(self);
        self.data.typeId = self.data.incidentTypes[0].id;
      },
      confirmations: {
        cancel: () => {
          this.setState(this.states.addMarker);
        },
        done: async () => {
          const { typeId, description } = this.states.addMarkerDetails.data;
          const [lon, lat] = this.states.addMarker.data.markerPosition;
          const loader = await this.loadingCtrl.create({
            message: 'Saving incident',
          });
          loader.present();
          this.incidentsService.addIncident(typeId, description, lon, lat).then(() => {
            this.getIncidents().then(() => {
              loader.dismiss();
            });
          });
          this.setState(this.states.default);
        }
      },
      data: {
        incidentTypes: [],
        typeId: null,
        description: '',
      },
      getIncidentTypes: async (self) => {
        self.data.incidentTypes = await this.incidentsService.getIncidentTypes();
      },
    },


    // Set up route state
    setUpRoute: {
      setup: async (self) => {
        // load drones if not already loaded
        const loader = await this.loadingCtrl.create();
        loader.present();

        if (!self.data.drones.length) {
          await Promise.all([
            self.getAnimalIds(self),
            self.getDrones(self),
          ]);
        }

        // add a drone if none exist
        if (!self.data.drones.length) {
          await self.confirmations.add();
        }

        loader.dismiss();

        // set the first drone in the list as the active drone
        self.data.selectedDrone = self.data.drones[0];
      },
      tooltip: 'Configure drone flight options',
      confirmations: {
        cancel: () => this.setState(this.states.default),
        done: async (self) => {
          const loader = await this.loadingCtrl.create({
            message: 'Saving drone information',
          });
          loader.present();
          try {
            await this.dronesService.updateDrones(this.states.setUpRoute.data.drones);
            await self.getDrones(self);
            console.log(self.data.drones);
            // find the ID of the drone in case it has just been added
            const currentlySelectedDrone = self.data.selectedDrone;
            self.data.selectedDrone = self.data.drones.find(drone => {
              return (
                drone.name === currentlySelectedDrone.name &&
                drone.avgSpeed === currentlySelectedDrone.avgSpeed &&
                drone.avgFlightTime === currentlySelectedDrone.avgFlightTime
              );
            });
            console.log(self.data.selectedDrone);
            this.setState(this.states.viewRoute);
          } catch (err) {
            console.error('found error', err);
            const alert = await this.alertCtrl.create({
              message: 'An unknown error occurred',
              buttons: [
                {
                  role: 'cancel',
                  text: 'Okay',
                },
              ],
            });
            alert.present();
          } finally {
            loader.dismiss();
          }
        },
        add: async () => {
          // TODO: Add a new drone to the list
          const newDrone: Drone = {
            name: 'New Drone',
            avgSpeed: 30,
            avgFlightTime: 100,
            active: true,
            longitude: null,
            latitude: null,
          };
          this.states.setUpRoute.data.drones.push(newDrone);
          this.states.setUpRoute.data.selectedDrone = newDrone;
        },
      },
      data: {
        selectedDrone: null,
        drones: [],

        flightTypes: Object.keys(FlightTypes).map(key => FlightTypes[key]),
        selectedFlightType: FlightTypes.ANIMAL,

        animalIds: [],
        selectedAnimalIds: {},
      },
      getDrones: async (self) => {
        self.data.drones = await this.dronesService.getDrones();
      },
      getAnimalIds: async (self) => {
        self.data.animalIds = await this.droneRouteService.getAnimalIds();
        self.data.selectedAnimalIds = Object.keys(self.data.animalIds).reduce((ob, id) => {
          ob[id] = false;
          return ob;
        }, {});
      },
      hasExceededNumSelectedAnimals: (self) => {
        return Object.keys(self.data.selectedAnimalIds).reduce((total, id) => {
          return total + (self.data.selectedAnimalIds[id] ? 1 : 0);
        }, 0) >= 5;
      },
    },


    // View route state
    viewRoute: {
      setup: async (self) => {
        self.data.routeIndex = 0;

        const startingCoords = this.coordinates;
        const drone = this.states.setUpRoute.data.selectedDrone;
        const flightType = this.states.setUpRoute.data.selectedFlightType;

        while (true) {
          const loader = await this.loadingCtrl.create({
            message: 'Generating route',
          });
          loader.present();
          try {
            // create a route based on the chosen route type
            if (flightType == FlightTypes.INCIDENT) {
              self.data.routes = await this.droneRouteService.generateIncidentRoutes(drone.id, startingCoords);
            } else if (flightType == FlightTypes.HOTSPOTS) {
              self.data.routes = await this.droneRouteService.generateHotspotRoutes(drone.id, startingCoords);
            } else if (flightType == FlightTypes.ANIMAL) {
              const animalIdsMap = this.states.setUpRoute.data.selectedAnimalIds;
              const res = await this.droneRouteService.generatePredictiveRoutes(
                drone.id,
                startingCoords,
                Object.keys(animalIdsMap).filter(id => animalIdsMap[id]),
              );

              self.data.routes = res.routes;

              // draw the animal positions
              const predictedPathsLayer = new VectorLayer({
                source: new VectorSource({
                  features: new GeoJSON().readFeatures({
                    type: 'FeatureCollection',
                    features: res.futureLocations.map(loc => lineString(loc.positions)),
                  }, {
                    featureProjection: 'EPSG:3857',
                  }),
                }),
                style: () => new Style({
                  stroke: new Stroke({
                    width: 3,
                    color: '#f09',
                  }),
                }),
                updateWhileAnimating: false,
                updateWhileInteracting: false,
              });

              const tempLayer = self.data.predictedPathsLayer;
              this.map.addLayer(predictedPathsLayer);
              self.data.predictedPathsLayer = predictedPathsLayer;
              this.map.removeLayer(tempLayer);
            }
            break;
          } catch (err) {
            console.error(err);
            loader.dismiss();
            const retry = await new Promise(async resolve => {
              const alert = await this.alertCtrl.create({
                message: 'An unknown error occurred',
                buttons: [
                  {
                    role: 'cancel',
                    text: 'Cancel',
                    handler: () => {
                      return resolve(false);
                    },
                  },
                  {
                    text: 'Retry',
                    handler: () => {
                      return resolve(true);
                    },
                  }
                ],
              });
              alert.present();
            });

            if (!retry) {
              this.setState(this.states.setUpRoute);
              return;
            }
          } finally {
            loader.dismiss();
          }
        }

        if (!self.data.routes.length) {
          const alert = await this.alertCtrl.create({
            message: 'Failed to find any routes for your input',
            buttons: [
              {
                role: 'cancel',
                text: 'Okay',
                handler: () => {
                  this.setState(this.states.setUpRoute);
                },
              },
            ],
          });

          alert.present();
          return;
        }

        self.renderRoute(self);

        // create depot
        self.data.depotLayer = new VectorLayer({
          source: new VectorSource({ features: [
            new Feature({
              geometry: new Point(fromLonLat([self.data.routes[0][0][0], self.data.routes[0][0][1]])),
            }),
          ] }),
          style: new Style({
            image: new CircleStyle({
              radius: 10,
              fill: new Fill({ color: '#f09' }),
            }),
          })
        });

        this.map.addLayer(self.data.depotLayer);
      },
      tooltip: 'Viewing route',
      confirmations: {
        done: async (self) => {
          const alert = await this.alertCtrl.create({
            message: 'Do you want to accept this route?',
            buttons: [
              {
                role: 'cancel',
                text: 'Cancel',
              },
              {
                text: 'Accept',
                handler: async () => {
                  // TODO: Tell the server to send the route to the user
                  const loader = await this.loadingCtrl.create();
                  loader.present();
                  try {
                    await this.droneRouteService.selectDroneRoute(
                      this.states.setUpRoute.data.selectedDrone.id,
                      self.data.routes[self.data.routeIndex],
                    )
                  } catch (err) {
                    console.error(err);
                    const errorAlert = await this.alertCtrl.create({
                      message: 'An unknown error occurred',
                    });
                    errorAlert.present();
                  }
                  loader.dismiss();
                  this.setState(this.states.default);
                },
              },
            ],
          });
          alert.present();
        },
        cancel: async () => {
          this.setState(this.states.default);
        },
        prev: (self) => {
          if (self.isAtStart(self)) {
            return;
          }
          self.data.routeIndex--;
          self.renderRoute(self);
        },
        next: (self) => {
          if (self.isAtEnd(self)) {
            return;
          }
          self.data.routeIndex++;
          self.renderRoute(self);
        },
      },
      data: {
        routeIndex: 0,
        routes: [],
        routeLayer: null,
        depotLayer: null,
        antPathUpdate: null,
        predictedPathsLayer: null,
      },
      isAtStart: (self) => self.data.routeIndex <= 0,
      isAtEnd: (self) => self.data.routeIndex >= self.data.routes.length - 1,
      destruct: async (self) => {
        // remove the map layer from the map
        self.data.antPathUpdate = null;
        this.map.removeLayer(self.data.routeLayer);
        this.map.removeLayer(self.data.depotLayer);
        this.map.removeLayer(self.data.predictedPathsLayer);
        // encourage garbage collection on the layer data
        self.data.routeLayer = null;
        // track to the current user's location
        this.goToGeolocation();
      },
      renderRoute: async (self) => {
        const route = self.data.routes[self.data.routeIndex];

        if (self.data.routeLayer) {
          this.map.removeLayer(self.data.routeLayer);
        }

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

        const antPathUpdate = () => {
          const offset = stroke.getLineDashOffset() || 0;
          stroke.setLineDashOffset(modulo(offset + 0.25, length));
          vector.refresh();

          if (self.data.antPathUpdate === antPathUpdate) {
            requestAnimationFrame(self.data.antPathUpdate);
          }
        };

        self.data.antPathUpdate = antPathUpdate;
        self.data.antPathUpdate();

        this.map.addLayer(self.data.routeLayer);
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
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
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

    if (!!this.timePoller) {
      clearInterval(this.timePoller);
    }

    if (!!this.mapUpdateInterval) {
      clearInterval(this.mapUpdateInterval);
    }
  }

  ngAfterViewInit() {
    this.initialiseMap();

    // get incidents every minute
    this.incidentsPoller = setInterval(() => {
      this.getIncidents();
    }, 5000);

    // update the map size on an interval
    this.mapUpdateInterval = setInterval(() => {
      if (this.map) {
        this.map.updateSize();
      }
    }, 1000);

    // preload incident types
    this.states.addMarkerDetails.getIncidentTypes(this.states.addMarkerDetails);

    // preload drones
    this.states.setUpRoute.getDrones(this.states.setUpRoute);

    // preload animal IDs
    this.states.setUpRoute.getAnimalIds(this.states.setUpRoute);
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

  /**
   * Initialises the map element and tile layers.
   * Starts geolocation listening and getting incidents.
   * Then draws the reserve and zooms to it.
   */
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
            url: 'https://mt{0-3}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=en',
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
    const reserve: any = await this.mapService.getMap();

    // draw the reserve
    this.drawReserve(reserve);

    // animate zoom to the reserve
    const MAX_ZOOM = 18;
    const MIN_ZOOM = 9;

    const view = this.map.getView();
    view.setMaxZoom(MAX_ZOOM);

    // set centre coordinates if geolocation hasn't been found yet
    if (!this.coordinates) {
      const reserveCenter = center(reserve).geometry.coordinates;

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
        extent: transformExtent(bbox(reserve), 'EPSG:4326', 'EPSG:3857'),
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

    const tempLayer = this.incidentsLayer;
    this.incidentsLayer = layer;
    this.map.addLayer(this.incidentsLayer);

    if (tempLayer) {
      this.map.removeLayer(tempLayer);
    }
  }

  refresh() {
    this.cdr.detectChanges();
  }

  @HostListener('window:resize', ['$event'])
  onPageResize(event) {
    this.map.updateSize();
  }
}

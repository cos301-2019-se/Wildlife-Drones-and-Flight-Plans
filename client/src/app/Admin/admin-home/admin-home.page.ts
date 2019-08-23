import { Component, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, HostListener } from '@angular/core';

import { fromLonLat, transformExtent, toLonLat } from 'ol/proj';
import Map from 'ol/Map';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorLayer, Tile as TileLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import LineString from 'ol/geom/LineString';

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
import { animations } from './admin-home.page.animations';
import center from '@turf/center';
import { DronesService } from '../../services/drones.service';
import { HeatmapService, MapCell } from '../../services/heatmap.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { IncidentsService } from '../../services/incidents.service';
import { DroneRouteService } from '../../services/drone-route.service';
import { modulo } from 'ol/math';
interface MapState {
  setup?: (self: MapState) => Promise<any>;
  destruct?: (self: MapState) => Promise<any>;
  confirmations?: {
    add?: () => void;
    cancel?: () => void;
    done?: () => void;
    next?: (state: MapState) => void;
    prev?: (state: MapState) => void;
  };
  tooltip?: string;
  data?: {
    [s: string]: any;
  };
  [s: string]: any;
  isAtStart?: (state: MapState) => boolean;
  isAtEnd?: (state: MapState) => boolean;
}

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
  animations,
})
export class AdminHomePage implements AfterViewInit, OnDestroy {
  @ViewChild('map') mapElement: ElementRef;
  private map: Map;
  private mapUpdateInterval;

  private geolocationSubscription: Subscription;
  public coordinates: Coordinates;
  public isFollowingGeolocation = false;

  private dronesPoller = null;
  dronesLayer = null;

  incidentsLayer = null;
  private incidentsPoller = null;

  poachingHeatmapLayer = null;
  animalHeatmapLayer = null;
  hotspotHeatmapLayer = null;
  private timePoller = null;

  public withinReserve = true;

  public flightPlans = [];
  public flightPlanIndex = 0;
  public flightPlanLayer = null;
  private flightPathAntUpdate = null;

  readonly states = {
    // default state
    default: {
      setup: async (self) => {
        this.flightPlans = await this.droneRouteService.getPastRoutes();
        console.log('plans', this.flightPlans);
        if (this.flightPlans.length) {
          self.renderRoute(self);
        }
      },
      confirmations: {
        prev: async (self) => {
          this.flightPlanIndex--;
          self.renderRoute(self);
        },
        next: async (self) => {
          this.flightPlanIndex++;
          self.renderRoute(self);
        },
      },
      isAtStart: () => this.flightPlanIndex === 0,
      isAtEnd: () => this.flightPlans.length === 0 || this.flightPlanIndex >= this.flightPlans.length - 1,
      renderRoute: async (self) => {
        const plan = this.flightPlans[this.flightPlanIndex];
        const route = JSON.parse(plan.points);

        if (this.flightPlanLayer) {
          this.map.removeLayer(this.flightPlanLayer);
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

        this.flightPlanLayer = new VectorLayer({
          source: vector,
          style: [
            lineStyle,
            dashStyle,
          ],
          updateWhileAnimating: true,
          updateWhileInteracting: true,
          zIndex: 99999,
        });

        const stroke = dashStyle.getStroke();
        const dash = stroke.getLineDash();
        let length = dash.reduce((a, b) => a + b, 0);
        length = dash.length % 2 === 1 ? length * 2 : length;

        const antPathUpdate = () => {
          const offset = stroke.getLineDashOffset() || 0;
          stroke.setLineDashOffset(modulo(offset + 0.25, length));
          vector.refresh();

          if (this.flightPathAntUpdate === antPathUpdate) {
            requestAnimationFrame(this.flightPathAntUpdate);
          }
        };

        this.flightPathAntUpdate = antPathUpdate;
        this.flightPathAntUpdate();

        this.map.addLayer(this.flightPlanLayer);
      }
    },

    // map options state
    options: {
      setup: async (self) => {
        const loader = await this.loadingCtrl.create({
          message: 'Loading map cells',
        });
        loader.present();
        try {
          if (!self.data.cellData.length) {
            await self.loadCells(self);
          }
          if (!self.data.species.length) {
            self.data.species = await this.heatmapService.getAnimalSpecies();
            self.data.animalHeatmapSpecies = self.data.species[0].id;
          }
        } catch (err) {
          console.error(err);
          this.setState(this.states.default);

          const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'An unknown error occurred',
            buttons: [
              {
                role: 'cancel',
                text: 'Okay',
              },
            ],
          });
          alert.present();
          loader.dismiss();
          return;
        }

        loader.dismiss();

        self.updateTime(self);
      },
      confirmations: {
        done: async (self) => {
          const loader = await this.loadingCtrl.create();
          loader.present();
          try {
            await Promise.all([
              self.showPoachingHeatmap(self),
              self.showAnimalHeatmap(self),
              self.showHotspotHeatmap(self),
              this.getDrones(),
            ]);
          } catch (err) {
            console.error(err);
            loader.dismiss();
          }
          loader.dismiss();
          this.setState(this.states.default);
        },
      },
      data: {
        cellData: [],
        species: [],
        enableHotspotHeatmap: false,
        enablePoachingHeatmap: false,
        enableAnimalHeatmap: false,
        enableActiveDrones: true,
        enablePastFlightPlans:false,
        animalHeatmapSpecies: null,
        useCurrentTime: true,
        time: 0,
      },
      loadCells: async (self) => {
        self.data.cellData = await this.heatmapService.getCells();
      },
      updateTime: (self) => {
        if (self.data.useCurrentTime) {
          self.data.time = Math.floor(
            (new Date().getHours() * 60 + new Date().getMinutes()) / 120
          ) * 120; // time in minutes floored to two hours
        }
      },
      showHotspotHeatmap: async (self) => {
        if (!self.data.enableHotspotHeatmap) {
          if (this.hotspotHeatmapLayer) {
            this.map.removeLayer(this.hotspotHeatmapLayer);
            this.hotspotHeatmapLayer = null;
          }
          return;
        }

        const hotspots = await this.heatmapService.getHotspotsCellWeights();
        const weights = hotspots.reduce((ob, hotspot) => {
          ob[hotspot.cellId] = 1;
          return ob;
        }, {});

        const heatmap = await self.createHeatmap(self, weights, [
          [0, 0, 0],
          [255, 255, 255],
        ], 999);

        this.map.removeLayer(this.hotspotHeatmapLayer);
        this.hotspotHeatmapLayer = heatmap;
        this.map.addLayer(this.hotspotHeatmapLayer);
      },
      showPoachingHeatmap: async (self) => {
        if (!self.data.enablePoachingHeatmap) {
          if (this.poachingHeatmapLayer) {
            this.map.removeLayer(this.poachingHeatmapLayer);
            this.poachingHeatmapLayer = null;
          }
          return;
        }

        const weights = await this.heatmapService.getPoachingDataCellWeights();

        const heatmap = self.createHeatmap(self, weights, [
          [2, 2, 15],
          [43, 16, 96],
          [99, 26, 127],
          [162, 49, 126],
          [237, 90, 95],
          [254, 186, 129],
          [252, 249, 187],
        ]);

        if (this.poachingHeatmapLayer) {
          this.map.removeLayer(this.poachingHeatmapLayer);
        }
        this.poachingHeatmapLayer = heatmap;
        this.map.addLayer(this.poachingHeatmapLayer);
      },
      showAnimalHeatmap: async (self) => {
        self.updateTime(self);

        if (!self.data.enableAnimalHeatmap) {
          if (this.animalHeatmapLayer) {
            this.map.removeLayer(this.animalHeatmapLayer);
            this.animalHeatmapLayer = null;
          }
          return;
        }

        const weights = await this.heatmapService.getSpeciesDataCellWeights(
          self.data.animalHeatmapSpecies,
          self.data.time,
        );

        const heatmap = self.createHeatmap(self, weights, [
          [71, 16, 100],
          [60, 81, 138],
          [45, 116, 142],
          [33, 147, 140],
          [54, 184, 120],
          [109, 206, 89],
          [175, 221, 48],
          [245, 229, 33],
        ]);

        if (this.animalHeatmapLayer) {
          this.map.removeLayer(this.animalHeatmapLayer);
        }
        this.animalHeatmapLayer = heatmap;

        this.map.addLayer(this.animalHeatmapLayer);
      },
      createHeatmap: (self, cellWeights, gradient, zIndex = 1) => {
        const OPACITY = 0.8;

        const features = self.data.cellData.map((cell: MapCell) => ({
          ...cell.geoJSON,
          properties: {
            weight: cellWeights[cell.id] || 0,
          },
        }));

        const getGradientColour = (value: number) => {
          const startIdx = Math.floor(value * (gradient.length - 1));
          return gradient[startIdx];
        };

        return new VectorLayer({
          source: new VectorSource({
            features: new GeoJSON().readFeatures({
              type: 'FeatureCollection',
              features,
            }, {
              featureProjection: 'EPSG:3857',
            }),
          }),
          updateWhileAnimating: false,
          updateWhileInteracting: false,
          renderMode: 'image',
          zIndex,
          style: cell => {
            const weight = cell.getProperties().weight;
            return new Style({
              fill: new Fill({
                color: [
                  ...getGradientColour(weight),
                  (0.3 + 0.7 * weight) * OPACITY,
                ],
              }),
            });
          },
        });
      },
    }
  };

  state: MapState = this.states.default;

  constructor(
    private mapService: MapService,
    private geolocationService: GeolocationService,
    private cdr: ChangeDetectorRef,
    private dronesService: DronesService,
    private heatmapService: HeatmapService,
    private droneRouteService: DroneRouteService,
    private incidentsService: IncidentsService,
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

    if (!!this.dronesPoller) {
      clearInterval(this.dronesPoller);
    }

    if (!!this.timePoller) {
      clearInterval(this.timePoller);
    }

    if (!!this.mapUpdateInterval) {
      clearInterval(this.mapUpdateInterval);
    }

    if (!!this.incidentsPoller) {
      clearInterval(this.incidentsPoller);
    }
  }

  ngAfterViewInit() {
    this.initialiseMap();

    this.setState(this.states.default);

     // get incidents every minute
    this.incidentsPoller = setInterval(() => {
      this.getIncidents();
    }, 5000);

    // poll drone locations
    this.dronesPoller = setInterval(() => {
      this.getDrones();
    }, 5000);

    // update the map size on an interval
    this.mapUpdateInterval = setInterval(() => {
      if (this.map) {
        this.map.updateSize();
      }
    }, 1000);

    // preload map cells for settings
    this.states.options.loadCells(this.states.options);
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
    this.getDrones();

    // get the reserve data
    const reserve: any = await this.mapService.getMap();

    // draw the reserve
    this.drawReserve(reserve);

    // animate zoom to the reserve
    const MAX_ZOOM = 18;
    const MIN_ZOOM = 7;

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
  async getDrones() {
    // if showing active drones has been disabled, hide from the map
    if (!this.states.options.data.enableActiveDrones) {
      if (this.dronesLayer) {
        this.map.removeLayer(this.dronesLayer);
        this.dronesLayer = null;
      }
      return;
    }

    const drones = await this.dronesService.getDrones();
    console.log('drones', drones);

    const layer = new VectorLayer({
      source: new VectorSource({
        features: drones.map(drone => new Feature({
          geometry: new Point(fromLonLat([drone.longitude, drone.latitude], 'EPSG:3857')),
        })),
      }),
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: 'orange',
          }),
        }),
      }),
      zIndex: 9999,
    });

    const tempLayer = this.dronesLayer;

    this.dronesLayer = layer;
    this.map.addLayer(this.dronesLayer);

    if (tempLayer) {
      this.map.removeLayer(tempLayer);
    }
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
            color: '#f09',
          }),
        }),
      }),
      zIndex: 9999,
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


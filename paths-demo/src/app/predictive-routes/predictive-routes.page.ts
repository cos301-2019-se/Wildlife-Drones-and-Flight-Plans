import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { convertLength, lineString } from '@turf/helpers';
import distance from '@turf/distance';
import along from '@turf/along';

import * as leaflet from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw-drag';
import 'leaflet-textpath';

import config from '../../config';
import { PredictiveSolver } from 'src/libraries/predictive-solver';
import { getDistance } from '../../libraries/util';

@Component({
  selector: 'app-predictive-routes',
  templateUrl: './predictive-routes.page.html',
  styleUrls: ['./predictive-routes.page.scss'],
})
export class PredictiveRoutesPage implements OnInit {

  @ViewChild('map', { static: true }) mapElement: ElementRef;
  private map: leaflet.Map;

  droneInfo = {
    flightSpeed: 30,
    flightDuration: 15,
  };

  depot = new leaflet.CircleMarker(config.START_POINT as leaflet.LatLngExpression).bindTooltip('Depot');
  drawnItems = new leaflet.FeatureGroup();
  paths = new leaflet.FeatureGroup();
  points = new leaflet.FeatureGroup();

  constructor() {}

  ngOnInit() {
    // initialise the map
    this.map = leaflet.map(this.mapElement.nativeElement);
    this.map.setView(config.START_POINT as leaflet.LatLngExpression, 13);

    // ensure the map is the right size
    setTimeout(() => this.map.invalidateSize(), 0);

    // add tile layer
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      opacity: 0.75,
    }).addTo(this.map);

    // drawn items
    this.map.addLayer(this.drawnItems);

    // draw control
    const drawControl = new leaflet.Control.Draw({
      draw: {
        polygon: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: {
        featureGroup: this.drawnItems,
      },
    });
    this.map.addControl(drawControl);

    // add items to layer on draw
    this.map.on(leaflet.Draw.Event.CREATED, (e: any) => {
      this.drawnItems.addLayer(e.layer);
    });

    this.map.on(leaflet.Draw.Event.DELETED, (e: any) => {
      // prevent depot from being deleted      
      for (const i in e.layers._layers) {
        if (e.layers._layers[i] === this.depot) {
          this.drawnItems.addLayer(this.depot);
        }
      }
    });

    // show depot
    this.drawnItems.addLayer(this.depot);

    // show points
    this.map.addLayer(this.points);

    // show paths
    this.map.addLayer(this.paths);
  }

  generateRoutes() {
    this.points.clearLayers();

    const depot = [this.depot.getLatLng().lng, this.depot.getLatLng().lat];
    const drawnPaths = this.drawnItems
      .getLayers()
      .filter(layer => layer !== this.depot && (layer as any).getLatLngs().length)
      
    const paths = drawnPaths
      .map(layer => {
        const latLngs = (layer as any).getLatLngs().map(latLng => [latLng.lng, latLng.lat]);

        let totalDistance = 0;
        let prev = latLngs[0];

        latLngs.forEach(latLng => {
          if (latLng === prev) return;
          totalDistance += distance(latLng, prev, {
            units: 'degrees',
          });
          prev = latLng;
        });

        return {
          speed: totalDistance / (this.droneInfo.flightDuration * 60),
          positions: latLngs
        };
      });

    const flightSpeed = convertLength(this.droneInfo.flightSpeed / 60 / 60, 'kilometers', 'degrees');
    const maxFlightDistanceDegrees = convertLength(this.calculateFlightDistance(), 'kilometers', 'degrees');

    const routes = new PredictiveSolver().createRoute(
      flightSpeed,
      maxFlightDistanceDegrees,
      depot[0],
      depot[1],
      paths
    );

    this.paths.clearLayers();

    const colors = [
      'fuchsia',
      'red',
      'orange',
      'green',
      'blue',
      'hotpink',
      'teal',
    ];

    routes.forEach((route, routeIndex) => {
      const path = new leaflet.Polyline(route.map(point => new leaflet.LatLng(point[1], point[0]), {}));
      path.setStyle({
        color: colors[routeIndex % colors.length],
        weight: 3,
        opacity: 0.5,
      });

      // const distance = getDistance(route, 'kilometers');

      (path as any).setText(`Foo`, {
        below: true,
        orientation: 'perpendicular',
      });

      this.paths.addLayer(path);
      this.animatePointAlongPath(
        path,
        convertLength(this.droneInfo.flightSpeed / 60 / 60, 'kilometers', 'degrees'),
        'red',
      );
    });

    drawnPaths.forEach((path, pathIndex) => {
      const speed = paths[pathIndex].speed;
      this.animatePointAlongPath(path as any, speed);
    });
  }

  /**
   * Find flight distance for drone using d = vt
   */
  calculateFlightDistance() {
    return this.droneInfo.flightSpeed * this.droneInfo.flightDuration / 60;
  }

  /**
   * Animates a point along a line at the given speed
   * @param path Poly line
   * @param speed Speed in degrees per second
   */
  animatePointAlongPath(path: leaflet.Polyline, speed: number, color = 'blue') {
    const SPEEDUP = 50;
    speed *= SPEEDUP;

    const points = (path.getLatLngs() as leaflet.LatLng[]).map(p => [p.lng, p.lat]);

    const pointsDistance = getDistance(points, 'degrees');
    const timeToTake = pointsDistance / speed;


    const point = new leaflet.Marker([points[0][1], points[0][0]], {
      icon: new leaflet.Icon({
        iconUrl: `/assets/marker-icon-${color}.png`,
        shadowUrl: '/assets/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    });
    this.points.addLayer(point);

    const timeStart = Date.now();
    let lastPoint = null;
    const an = () => {
      const timeDelta = (Date.now() - timeStart) / 1000;
      const distanceAlong = pointsDistance * (timeDelta / timeToTake);

      const posAlong = along(lineString(points), distanceAlong, { units: 'degrees' });

      const posAlongPoint = [posAlong.geometry.coordinates[0], posAlong.geometry.coordinates[1]];
      if (lastPoint && posAlongPoint[0] === lastPoint[0] && posAlongPoint[1] === lastPoint[1]) {
        return;
      }
      lastPoint = posAlongPoint;
      
      point.setLatLng([posAlongPoint[1], posAlongPoint[0]]);

      requestAnimationFrame(an);
    };

    an();

  }

}

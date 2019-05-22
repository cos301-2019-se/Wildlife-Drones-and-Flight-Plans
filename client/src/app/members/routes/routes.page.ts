import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import leaflet from 'leaflet';
import { NavController } from '@ionic/angular';
import { RoutingServiceService } from '../../services/routes/routing-service.service';
@Component({
  selector: 'app-routes',
  templateUrl: './routes.page.html',
  styleUrls: ['./routes.page.scss'],
})
export class RoutesPage {
  @ViewChild('map') mapContainer: ElementRef;
  map: any;
  constructor(public navCtrl: NavController, private routeService: RoutingServiceService, ) {

  }

  ionViewDidEnter() {
    this.loadmap();
  }

  async fetchData() {
    const routes = await this.routeService.getRoute();
    return routes;
  }

  async loadmap() {
    this.map = leaflet.map('map').fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
    }).addTo(this.map);
    const routes = await this.fetchData();
    this.map.flyTo([routes[0].input[0], routes[0].input[1]], 10);
    const allRoutes = JSON.parse(JSON.stringify(routes));
    var previousRoute = null;
    allRoutes.forEach(route => {

      if (previousRoute == null) {
        previousRoute = route;
      }
      else {
        const prevPointA = new leaflet.LatLng(previousRoute.output[0], previousRoute.output[1]);
        const prevPointB = new leaflet.LatLng(route.input[0], route.input[1]);
        const predPrevPointA = new leaflet.LatLng(previousRoute.prediction[0], previousRoute.prediction[1]);
        const predPrevPointB = new leaflet.LatLng(route.input[0], route.input[1]);
        const prevPointList = [prevPointA, prevPointB];
        const predPrevPointList = [predPrevPointA, predPrevPointB];
        const prevFirstpolyline = new leaflet.Polyline(prevPointList, {
          color: 'red',
          weight: 2,
        });
        prevFirstpolyline.addTo(this.map);
        const predPrevFirstpolyline = new leaflet.Polyline(predPrevPointList, {
          color: 'blue',
          weight: 2,
        });
        predPrevFirstpolyline.addTo(this.map);
      }
      const pointA = new leaflet.LatLng(route.input[0], route.input[1]);
      const pointB = new leaflet.LatLng(route.output[0], route.output[1]);
      const pointList = [pointA, pointB];

      const firstpolyline = new leaflet.Polyline(pointList, {
        color: 'red',
        weight: 2,
      });
      firstpolyline.addTo(this.map);

      const predPointB = new leaflet.LatLng(route.prediction[0], route.prediction[1]);
      const predPointList = [pointA, predPointB];

      const predFirstpolyline = new leaflet.Polyline(predPointList, {
        color: 'blue',
        weight: 2,
      });
      predFirstpolyline.addTo(this.map);

      previousRoute = route;
    });
    console.log(routes);

  }

}

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
        // Takes previous known point and draws to next input
        const prevPointA = new leaflet.LatLng(previousRoute.output[0], previousRoute.output[1]);
        const prevPointB = new leaflet.LatLng(route.input[0], route.input[1]);
        this.drawPoints(prevPointA,prevPointB, 'red');
        ///////////////////////////////////////////////////////
        // Takes previous prediction and draws to next known point
        const predPrevPointA = new leaflet.LatLng(previousRoute.prediction[0], previousRoute.prediction[1]);
        const predPrevPointB = new leaflet.LatLng(route.input[0], route.input[1]);
        this.drawPoints(predPrevPointA, predPrevPointB, 'blue');
        ////////////////////////////////////////////////////////////
      }

      // Takes input and draws to next known point
      const pointA = new leaflet.LatLng(route.input[0], route.input[1]);
      const pointB = new leaflet.LatLng(route.output[0], route.output[1]);
      this.drawPoints(pointA , pointB, 'red');
      ///////////////////////////////////////////

      // Takes inputs and draws to next predicted point
      const predPointB = new leaflet.LatLng(route.prediction[0], route.prediction[1]);
      this.drawPoints(pointA, predPointB, 'blue');
      /////////////////////////////////////////////////
      previousRoute = route;
    });
    console.log(routes);

  }

  drawPoints(from,to,color)
  {
      const pointList = [from, to];

      const firstpolyline = new leaflet.Polyline(pointList, {
        color: color,
        weight: 2,
      });
      firstpolyline.addTo(this.map);

  }

}

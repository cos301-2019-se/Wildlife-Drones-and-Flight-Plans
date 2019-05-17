import { Component, OnInit } from '@angular/core';
import { MapOptions, Map, Draw, Control, tileLayer, FeatureGroup } from 'leaflet';
import { MapService } from '../../services/map/map.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})
export class UpdatePage implements OnInit {
  private map: Map;
  private boxLayer = new FeatureGroup();
  mapOptions: MapOptions = {
    layers: [
      tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: null
      })
    ],
    zoom: 13,
    center: [-25.8974, 28.2906]
  };

  constructor(
    private mapService: MapService,
    private router: Router,
    private authentication: AuthenticationService,
    private alertCtrl: AlertController,
  ) { }

  logout()
  {
    this.authentication.logout();
  }

  ngOnInit() {
  }

  async mapReady(map: Map) {
    this.map = map;

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    map.addLayer(this.boxLayer);
    const drawControl = new Control.Draw({
      position: 'bottomleft',
      edit: {
        featureGroup: this.boxLayer,
        remove: false,
      },
      draw: {
        marker: false,
        circlemarker: false,
        polyline: false,
        rectangle: false,
        circle: false,
        polygon: false,
      }
    });

    map.on(Draw.Event.CREATED, async e => {
      const layer = (e as any).layer;

      const bounds = layer._bounds;
      const left = bounds._southWest.lng;
      const bottom = bounds._southWest.lat;
      const right = bounds._northEast.lng;
      const top = bounds._northEast.lat;

      console.log(top, left, bottom, right);

      this.boxLayer.addLayer(layer);
      const reserves = await this.mapService.findReserves(top, left, bottom, right);
      console.log(reserves);
      const reserveNames = reserves.features.map(feature => feature.properties.name);
      console.log(reserveNames);

      const alert = await this.alertCtrl.create({
        header: 'Select reserve',
        inputs: reserveNames.sort().map(name => {
          return {
            value: name,
            label: name,
            type: 'radio'
          };
        }),
        buttons: [
          {
            text: 'Select',
            handler: async (data) => {
              console.log(data);
              await this.mapService.updateMap(data);
              this.router.navigate(['home']);
            }
          }
        ]
      });

      alert.present();
    });

    map.addControl(drawControl);
  }

  startDrawing() {
    new Draw.Rectangle(this.map).enable();
  }

}

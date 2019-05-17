import { Component, ViewChild } from '@angular/core';
import { Draw, MapOptions, ControlOptions, Control, tileLayer, geoJSON, Map, point, polyline, DrawOptions, icon, FeatureGroup, featureGroup } from 'leaflet';
import 'leaflet-draw';
import { LeafletDirective } from '@asymmetrik/ngx-leaflet';
import { MapService } from '../../services/map/map.service';
import { antPath } from 'leaflet-ant-path';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  private map: Map;
  @ViewChild('leaflet') leaflet: LeafletDirective;

  shortestPath;
  points = [];
  pointsLayer: FeatureGroup = new FeatureGroup();
  shortestPathLayer = null;

  constructor(
    private mapService: MapService,
    private http: HttpClient,
  ) {}

  mapOptions: MapOptions = {
    layers: [
      // alternative https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
      tileLayer('http://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 18,
        attribution: null
      })
    ],
    zoom: 13,
    center: this.mapService.getCenter()
  };

  async mapReady(map: Map) {
    this.map = map;

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);

    const mapData = await this.mapService.getMap();

    console.log(mapData);

    const reserve = geoJSON(mapData.reserve as any, {
      style: feature => {
        return {
          color: 'red',
          weight: 1,
          fillColor: 'transparent'
        };
      }
    }).addTo(map);

    mapData.roads.forEach(road => geoJSON(road as any, {
      style: feature => {
        return {
          weight: 1,
          color: 'orange'
        };
      }
    }).addTo(map));

    mapData.dams.forEach(dam => geoJSON(dam as any, {
      style: feature => {
        return {
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 1
        };
      }
    }).addTo(map));

    mapData.rivers.forEach(river => geoJSON(river as any, {
      style: feature => {
        return {
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 1
        };
      }
    }).addTo(map));

    mapData.intermittentWater.forEach(water => geoJSON(water as any, {
      style: feature => {
        return {
          color: 'grey',
          fillColor: 'grey',
          fillOpacity: 0.7,
          dashArray: 10,
        };
      }
    }).addTo(map));

    mapData.residential.forEach(residence => geoJSON(residence as any, {
      style: feature => {
        return {
          color: 'grey',
          fillColor: 'grey',
          fillOpacity: 0.7,
        };
      }
    }).addTo(map));

    map.addLayer(this.pointsLayer);
    const drawControl = new Control.Draw({
      position: 'bottomleft',
      edit: {
        featureGroup: this.pointsLayer,
        remove: false,
        edit: false
      },
      draw: {
        marker: {
          icon: icon({
            iconSize: [25, 41],
            iconAnchor: [13, 41],
            iconUrl: 'assets/marker-icon.png',
            shadowUrl: 'assets/marker-shadow.png'
          })
        },
        circlemarker: false,
        polyline: false,
        rectangle: false,
        circle: false,
        polygon: false,
      }
    });

    map.on(Draw.Event.CREATED, async e => {
      const layer = (e as any).layer;
      console.log(e);
      console.log(this.pointsLayer);

      this.points.push([layer._latlng.lat, layer._latlng.lng]);
      this.pointsLayer.addLayer(layer);

      console.log('this points', this.points);

      const shortestPath: any[] = await this.http.post('http://localhost:3000/map/shortest-path', {
        points: this.points
      }).toPromise() as any;

      console.log(shortestPath);

      if (this.shortestPathLayer) {
        this.map.removeLayer(this.shortestPathLayer);
      }
      this.shortestPathLayer = polyline(shortestPath, {
        color: 'yellow',
        weight: 2
      });

      this.map.addLayer(this.shortestPathLayer);
    });

    map.addControl(drawControl);
  }

}

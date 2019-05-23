import { BrowserModule } from '@angular/platform-browser';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { HttpClientModule } from '@angular/common/http';

export const imports = [
  BrowserModule,
  IonicModule.forRoot(),
  AppRoutingModule,
  HttpClientModule,
  LeafletModule.forRoot(),
  LeafletDrawModule.forRoot(),
  IonicStorageModule.forRoot(),
];

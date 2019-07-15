import { BrowserModule } from '@angular/platform-browser';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const imports = [
  BrowserModule,
  BrowserAnimationsModule,
  IonicModule.forRoot({
    hardwareBackButton: false,
    mode: 'md',
  }),
  AppRoutingModule,
  HttpClientModule,
  LeafletModule.forRoot(),
  LeafletDrawModule.forRoot(),
  IonicStorageModule.forRoot(),
];

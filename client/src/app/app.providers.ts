import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { MapService } from './services/map/map.service';
import { AuthenticationService } from './services/authentication.service';

export const providers = [
  StatusBar,
  SplashScreen,
  MapService,
  AuthenticationService,
  { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
];

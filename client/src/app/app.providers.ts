import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { MapService } from './services/map/map.service';
import { AuthenticationService } from './services/authentication.service';
import { GeolocationService, GeolocationMockService } from './services/geolocation.service';
import { environment } from '../environments/environment';

export const providers = [
  StatusBar,
  SplashScreen,
  MapService,
  AuthenticationService,
  {
    provide: GeolocationService,
    useClass: environment.production ? GeolocationService : GeolocationMockService,
  },
  { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
];

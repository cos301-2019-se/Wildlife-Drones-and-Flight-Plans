import { TestBed } from '@angular/core/testing';

import { MapService } from './map.service';
import { imports } from '../../app.imports';
import { providers } from '../../app.providers';
import { AuthenticationService } from '../authentication.service';

describe('MapService', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports,
      providers,
    });
    const authService: AuthenticationService = TestBed.get(AuthenticationService);
   // await authService.login('evans.matthew97@gmail.com', '123');
  });

  it('should be created', () => {
    const service: MapService = TestBed.get(MapService);
    expect(service).toBeTruthy();
  });

  it('should get list of reserves from area', async () => {
    const service: MapService = TestBed.get(MapService);

    let successful = true;
    try {
      await service.findReserves(-25.842848319848027, 28.24808120727539, -25.943072422508394, 28.334255218505863);
    } catch (err) {
      console.error(err);
      successful = false;
    }

    expect(successful).toBeTruthy();
  });

  it('should update the map', async () => {
    const service: MapService = TestBed.get(MapService);

    let successful = true;
    try {
      await service.updateMap('Rietvlei Nature Reserve');
    } catch (err) {
      console.error(err);
      successful = false;
    }

    expect(successful).toBeTruthy();
  });
});

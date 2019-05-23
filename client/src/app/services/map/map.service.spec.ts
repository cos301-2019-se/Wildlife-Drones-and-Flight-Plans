import { TestBed } from '@angular/core/testing';

import { MapService } from './map.service';

describe('MapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

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
});

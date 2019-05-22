import { TestBed } from '@angular/core/testing';

import { RoutingServiceService } from './routing-service.service';

describe('RoutingServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RoutingServiceService = TestBed.get(RoutingServiceService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';

import { imports } from '../app.imports';
import { providers } from '../app.providers';

describe('AuthenticationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers,
    imports,
  }));

  it('should be created', () => {
    const service: AuthenticationService = TestBed.get(AuthenticationService);
    expect(service).toBeTruthy();
  });

  it('should log out', () => {
    const service: AuthenticationService = TestBed.get(AuthenticationService);
    let successful = true;
    try {
      service.logout();
    } catch (err) {
      successful = false;
    }

    expect(successful).toBeTruthy();
  });

  it('should not be authenticated by default', async () => {
    const service: AuthenticationService = TestBed.get(AuthenticationService);

    expect(service.isAuthenticated()).toBe(false);
  });

  it('should not be able to access guarded api services with an incorrect token', async () => {
    const service: AuthenticationService = TestBed.get(AuthenticationService);

    let successful = true;
    try {
      await service.post('map/update', {
        name: 'Rietvlei Nature Reserve'
      });
    } catch (err) {
      successful = false;
    }
    expect(successful).toBe(false);
  });

  it('should not authenticate with incorrect details', async () => {
    const service: AuthenticationService = TestBed.get(AuthenticationService);

    await service.login('evans.matthew97@gmail.com', '1234');

    expect(service.isAuthenticated()).toBe(false);
  });

  it('should authenticate with correct details', async () => {
    const service: AuthenticationService = TestBed.get(AuthenticationService);

    await service.login('evans.matthew97@gmail.com', '123');

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should access guarded api services with correct token', async () => {
    const service: AuthenticationService = TestBed.get(AuthenticationService);

    let successful = true;
    try {
      await service.post('map/update', {
        name: 'Rietvlei Nature Reserve'
      });
    } catch (err) {
      successful = false;
    }
    expect(successful).toBe(true);
  });
});

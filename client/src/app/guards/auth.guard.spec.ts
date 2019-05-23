import { TestBed, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { providers } from '../app.providers';
import { imports } from '../app.imports';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard, ...providers],
      imports,
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});

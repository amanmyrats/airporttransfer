import { TestBed } from '@angular/core/testing';

import { PopularRouteService } from './popular-route.service';

describe('PopularRouteService', () => {
  let service: PopularRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopularRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

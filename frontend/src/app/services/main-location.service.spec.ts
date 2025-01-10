import { TestBed } from '@angular/core/testing';

import { MainLocationService } from './main-location.service';

describe('MainLocationService', () => {
  let service: MainLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

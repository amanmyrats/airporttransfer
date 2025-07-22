import { TestBed } from '@angular/core/testing';

import { PhoneNormalizerService } from './phone-normalizer.service';

describe('PhoneNormalizerService', () => {
  let service: PhoneNormalizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhoneNormalizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

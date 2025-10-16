import { TestBed } from '@angular/core/testing';

import { FaqItemService } from './faq-item.service';

describe('FaqItemService', () => {
  let service: FaqItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaqItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { FaqItemTranslationService } from './faq-item-translation.service';

describe('FaqItemTranslationService', () => {
  let service: FaqItemTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaqItemTranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { FaqLibraryItemTranslationService } from './faq-library-item-translation.service';

describe('FaqLibraryItemTranslationService', () => {
  let service: FaqLibraryItemTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaqLibraryItemTranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

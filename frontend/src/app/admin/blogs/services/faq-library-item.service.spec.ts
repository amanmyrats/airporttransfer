import { TestBed } from '@angular/core/testing';

import { FaqLibraryItemService } from './faq-library-item.service';

describe('FaqLibraryItemService', () => {
  let service: FaqLibraryItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaqLibraryItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

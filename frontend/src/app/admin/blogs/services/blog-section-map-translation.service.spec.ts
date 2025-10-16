import { TestBed } from '@angular/core/testing';

import { BlogSectionMapTranslationService } from './blog-section-map-translation.service';

describe('BlogSectionMapTranslationService', () => {
  let service: BlogSectionMapTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogSectionMapTranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

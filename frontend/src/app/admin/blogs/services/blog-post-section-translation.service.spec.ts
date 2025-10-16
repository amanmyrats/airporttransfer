import { TestBed } from '@angular/core/testing';

import { BlogPostSectionTranslationService } from './blog-post-section-translation.service';

describe('BlogPostSectionTranslationService', () => {
  let service: BlogPostSectionTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogPostSectionTranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

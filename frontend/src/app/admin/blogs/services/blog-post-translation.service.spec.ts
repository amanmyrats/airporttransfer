import { TestBed } from '@angular/core/testing';

import { BlogPostTranslationService } from './blog-post-translation.service';

describe('BlogPostTranslationService', () => {
  let service: BlogPostTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogPostTranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

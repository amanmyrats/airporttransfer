import { TestBed } from '@angular/core/testing';

import { BlogVideoTranslationService } from './blog-video-translation.service';

describe('BlogVideoTranslationService', () => {
  let service: BlogVideoTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogVideoTranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

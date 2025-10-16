import { TestBed } from '@angular/core/testing';

import { BlogImageTranslationService } from './blog-image-translation.service';

describe('BlogImageTranslationService', () => {
  let service: BlogImageTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogImageTranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

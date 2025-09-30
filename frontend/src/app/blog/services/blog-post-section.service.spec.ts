import { TestBed } from '@angular/core/testing';

import { BlogPostSectionService } from './blog-post-section.service';

describe('BlogPostSectionService', () => {
  let service: BlogPostSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogPostSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

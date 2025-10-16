import { TestBed } from '@angular/core/testing';

import { BlogImageService } from './blog-image.service';

describe('BlogImageService', () => {
  let service: BlogImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

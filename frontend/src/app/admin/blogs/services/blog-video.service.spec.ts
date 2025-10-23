import { TestBed } from '@angular/core/testing';

import { BlogVideoService } from './blog-video.service';

describe('BlogVideoService', () => {
  let service: BlogVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogVideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

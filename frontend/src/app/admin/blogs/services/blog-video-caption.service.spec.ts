import { TestBed } from '@angular/core/testing';

import { BlogVideoCaptionService } from './blog-video-caption.service';

describe('BlogVideoCaptionService', () => {
  let service: BlogVideoCaptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogVideoCaptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

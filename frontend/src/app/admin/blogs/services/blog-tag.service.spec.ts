import { TestBed } from '@angular/core/testing';

import { BlogTagService } from './blog-tag.service';

describe('BlogTagService', () => {
  let service: BlogTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

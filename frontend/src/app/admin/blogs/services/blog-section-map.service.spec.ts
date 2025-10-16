import { TestBed } from '@angular/core/testing';

import { BlogSectionMapService } from './blog-section-map.service';

describe('BlogSectionMapService', () => {
  let service: BlogSectionMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogSectionMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

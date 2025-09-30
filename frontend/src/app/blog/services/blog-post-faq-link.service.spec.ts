import { TestBed } from '@angular/core/testing';

import { BlogPostFaqLinkService } from './blog-post-faq-link.service';

describe('BlogPostFaqLinkService', () => {
  let service: BlogPostFaqLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogPostFaqLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { UserColumnService } from './user-column.service';

describe('UserColumnService', () => {
  let service: UserColumnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserColumnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

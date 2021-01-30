import { TestBed } from '@angular/core/testing';

import { ProposeService } from './propose.service';

describe('ProposeService', () => {
  let service: ProposeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProposeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { JsPDFFontService } from './js-pdffont.service';

describe('JsPDFFontService', () => {
  let service: JsPDFFontService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsPDFFontService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

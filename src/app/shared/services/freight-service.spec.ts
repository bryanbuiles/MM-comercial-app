import { TestBed } from '@angular/core/testing';

import { FreightService } from './freight-service';

describe('FreightService', () => {
  let service: FreightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

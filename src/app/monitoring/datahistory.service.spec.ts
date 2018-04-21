import { TestBed, inject } from '@angular/core/testing';

import { DatahistoryService } from './datahistory.service';

describe('DatahistoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatahistoryService]
    });
  });

  it('should be created', inject([DatahistoryService], (service: DatahistoryService) => {
    expect(service).toBeTruthy();
  }));
});

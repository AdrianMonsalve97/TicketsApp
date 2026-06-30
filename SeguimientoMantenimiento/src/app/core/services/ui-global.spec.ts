import { TestBed } from '@angular/core/testing';

import { UiGlobal } from './ui-global';

describe('UiGlobal', () => {
  let service: UiGlobal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiGlobal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

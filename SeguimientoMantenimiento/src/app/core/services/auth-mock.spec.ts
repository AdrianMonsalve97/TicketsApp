import { TestBed } from '@angular/core/testing';

import { AuthMock } from './auth-mock';

describe('AuthMock', () => {
  let service: AuthMock;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

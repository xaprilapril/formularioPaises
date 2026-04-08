import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { ApiPaises } from './api-paises';

describe('ApiPaises', () => {
  let service: ApiPaises;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(ApiPaises);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

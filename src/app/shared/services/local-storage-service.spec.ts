import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage-service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getItem devuelve null si la clave no existe', () => {
    expect(service.getItem('missing')).toBeNull();
  });

  it('setItem y getItem redondean objetos JSON', () => {
    service.setItem('user', { id: 1, name: 'Ana' });
    expect(service.getItem<{ id: number; name: string }>('user')).toEqual({
      id: 1,
      name: 'Ana',
    });
  });

  it('getItem devuelve null si el valor no es JSON válido', () => {
    localStorage.setItem('bad', 'not-json{');
    expect(service.getItem('bad')).toBeNull();
  });

  it('removeItem elimina la clave', () => {
    service.setItem('k', 1);
    service.removeItem('k');
    expect(service.getItem('k')).toBeNull();
  });

  it('hasKey refleja existencia de clave', () => {
    expect(service.hasKey('x')).toBe(false);
    service.setItem('x', true);
    expect(service.hasKey('x')).toBe(true);
    service.removeItem('x');
    expect(service.hasKey('x')).toBe(false);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Product } from '@shared/models/product-interface';
import { AddonService } from '@shared/services/addon-service';
import { FreightService } from '@shared/services/freight-service';

import { QuoteProductRow } from './quote-product-row';

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'ENVASE 1L',
    description: 'Envase 1 litro',
    image: '',
    dimensions: '10x10',
    weight: '50g',
    package: 1,
    material: 'PET',
    neckSize: '28mm',
    type: 'ENVASE',
    originalPrice: 12330,
    originalPriceRestore: 10000,
  },
  {
    id: 2,
    name: 'ENVASE 2L',
    description: 'Envase 2 litros',
    image: '',
    dimensions: '12x12',
    weight: '80g',
    package: 1,
    material: 'PET',
    neckSize: '28mm',
    type: 'ENVASE',
    originalPrice: 15000,
  },
  {
    id: 3,
    name: 'BOTELLA 500ML',
    description: 'Botella media litro',
    image: '',
    dimensions: '8x8',
    weight: '30g',
    package: 1,
    material: 'PET',
    neckSize: '24mm',
    type: 'BOTELLA',
    originalPrice: 8000,
  },
];

describe('QuoteProductRow', () => {
  let component: QuoteProductRow;
  let fixture: ComponentFixture<QuoteProductRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteProductRow],
      providers: [
        { provide: AddonService, useValue: { getAddonByProduct: () => of([]) } },
        { provide: FreightService, useValue: { getFreight: () => of({ id: 1, freight: 500 }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteProductRow);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('rowIndex', 0);
    fixture.componentRef.setInput('cityId', 1);
    fixture.componentRef.setInput('catalog', mockProducts);
    fixture.componentRef.setInput('colors', [{ id: 1, name: 'Rojo' }]);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el dropdown al borrar y re-buscar tras seleccionar un producto', () => {
    component.setProduct(mockProducts[0]);

    component.onProductSearchInput({
      target: { value: 'EN' },
    } as unknown as Event);

    expect(component.filteredProducts().length).toBeGreaterThan(0);
    expect(component.showProductDropdown()).toBe(true);
    expect(component.selectedProduct()).toBeNull();
    expect(component.formModel().productId).toBe(0);
  });

  it('setProduct asigna selectedProduct y precio del catálogo', () => {
    component.setProduct(mockProducts[0]);

    expect(component.selectedProduct()).toEqual(mockProducts[0]);
    expect(component.formModel().productId).toBe(1);
    expect(component.formModel().price).toBe(12330);
  });

  it('onRestoreToggle actualiza el precio al precio de recuperado', () => {
    component.setProduct(mockProducts[0]);
    component.productForm.isRestore().value.set(true);
    component.onRestoreToggle();

    expect(component.formModel().price).toBe(10000);
  });

  it('canConfirmProduct es false hasta que freight resuelve', async () => {
    component.setProduct(mockProducts[0]);
    expect(component.canConfirmProduct()).toBe(false);

    await fixture.whenStable();

    expect(component.canConfirmProduct()).toBe(true);
  });

  it('canConfirmProduct es false cuando freight falla', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [QuoteProductRow],
      providers: [
        { provide: AddonService, useValue: { getAddonByProduct: () => of([]) } },
        {
          provide: FreightService,
          useValue: { getFreight: () => throwError(() => new Error('API error')) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteProductRow);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('rowIndex', 0);
    fixture.componentRef.setInput('cityId', 1);
    fixture.componentRef.setInput('catalog', mockProducts);
    fixture.componentRef.setInput('colors', [{ id: 1, name: 'Rojo' }]);

    component.setProduct(mockProducts[0]);
    await fixture.whenStable();

    expect(component.canConfirmProduct()).toBe(false);
    expect(component.freight.error()).toBeTruthy();
  });

  it('confirmProduct emite productConfirmed con freight del rxResource', async () => {
    const emitted: unknown[] = [];
    component.productConfirmed.subscribe((event) => emitted.push(event));

    component.setProduct(mockProducts[0]);
    await fixture.whenStable();

    component.productForm.color().value.set('Rojo');
    component.productForm.quantity().value.set(5);
    component.confirmProduct();

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toMatchObject({
      rowIndex: 0,
      product: expect.objectContaining({
        id: 1,
        name: 'ENVASE 1L',
        color: 'Rojo',
        quantity: 5,
        freight: 500,
      }),
    });
  });
});

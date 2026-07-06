import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductPlus } from '@shared/models/product-interface';
import { ColorService } from '@shared/service/color-service';
import { CitiesService } from '@shared/services/cities-service';
import { CompaniesService } from '@shared/services/companies-service';
import { ProductsService } from '@shared/services/products-service';

import { QuoteContainerComponent } from './quote-container-component';

const mockProductPlus: ProductPlus = {
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
  freight: 500,
  color: 'Rojo',
  quantity: 10,
};

describe('QuoteContainerComponent', () => {
  let component: QuoteContainerComponent;
  let fixture: ComponentFixture<QuoteContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteContainerComponent],
      providers: [
        { provide: CitiesService, useValue: { getAllCities: () => of([]) } },
        { provide: CompaniesService, useValue: { getAllCompanies: () => of([]) } },
        { provide: ProductsService, useValue: { getAllProducts: () => of([]) } },
        { provide: ColorService, useValue: { getAllColors: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no permite agregar productos si la cabecera no es válida', () => {
    expect(component.canAddProducts()).toBe(false);
  });

  it('acumula productos confirmados en productsList', () => {
    component.onProductConfirmed({ rowIndex: 0, product: mockProductPlus });

    expect(component.productsList()).toHaveLength(1);
    expect(component.productsList()[0].name).toBe('ENVASE 1L');
  });

  it('permite agregar otra fila solo si la última está confirmada', () => {
    expect(component.canAddAnotherProduct()).toBe(false);

    component.onProductConfirmed({ rowIndex: 0, product: mockProductPlus });

    expect(component.canAddAnotherProduct()).toBe(true);
  });

  it('agrega una nueva fila al confirmar la anterior', () => {
    component.onProductConfirmed({ rowIndex: 0, product: mockProductPlus });
    component.addProduct();

    expect(component.productRowIds()).toHaveLength(2);
  });
});

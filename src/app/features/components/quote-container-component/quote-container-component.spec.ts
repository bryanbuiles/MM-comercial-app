import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductPLus } from '@shared/models/product-interface';
import { QuotationRequest } from '@shared/models/quotation';
import { User, UserPLus } from '@shared/models/user-interface';
import { ColorService } from '@shared/services/color-service';
import { CitiesService } from '@shared/services/cities-service';
import { CompaniesService } from '@shared/services/companies-service';
import { LocalStorageService } from '@shared/services/local-storage-service';
import { ProductsService } from '@shared/services/products-service';
import { QuotationService } from '@shared/services/quotation-service';
import { UserService } from '@shared/services/user-service';

import { QuoteContainerComponent } from './quote-container-component';

const mockProductPlus: ProductPLus = {
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
  color: 'Rojo',
  addonProducts: [],
  restoreType: 'ORIGINAL',
};

const storedUser: User = {
  id: 7,
  name: 'Ana',
  email: 'ana@mm.com',
  role: 'USER',
};

const mockUserPlus: UserPLus = {
  ...storedUser,
  phone: '3001234567',
  position: 'Asesora comercial',
  signature: 'https://firma.example/ana.png',
};

const catalogProviders = [
  { provide: CitiesService, useValue: { getAllCities: () => of([]) } },
  { provide: CompaniesService, useValue: { getAllCompanies: () => of([]) } },
  { provide: ProductsService, useValue: { getAllProducts: () => of([]) } },
  { provide: ColorService, useValue: { getAllColors: () => of([]) } },
];

describe('QuoteContainerComponent', () => {
  let setQuotation: ReturnType<typeof vi.fn<(body: QuotationRequest) => ReturnType<QuotationService['setQuotation']>>>;

  beforeEach(() => {
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function showModal() {
        this.open = true;
      };
    }
    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function close() {
        this.open = false;
      };
    }
    vi.spyOn(window, 'open').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function setup(user: User | null): Promise<ComponentFixture<QuoteContainerComponent>> {
    setQuotation = vi.fn(() =>
      of({ url: 'https://example.com/cotizacion.pdf', fileName: 'cotizacion.pdf', expiresInSeconds: 60 }),
    );

    await TestBed.configureTestingModule({
      imports: [QuoteContainerComponent],
      providers: [
        ...catalogProviders,
        { provide: LocalStorageService, useValue: { getItem: () => user } },
        { provide: UserService, useValue: { getUserById: () => of(mockUserPlus) } },
        { provide: QuotationService, useValue: { setQuotation } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(QuoteContainerComponent);
    await fixture.whenStable();
    return fixture;
  }

  describe('con vendedor en sesión', () => {
    let component: QuoteContainerComponent;
    let fixture: ComponentFixture<QuoteContainerComponent>;

    beforeEach(async () => {
      fixture = await setup(storedUser);
      component = fixture.componentInstance;
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

    it('no llama al servicio si no hay productos confirmados', () => {
      component.generateQuote();

      expect(setQuotation).not.toHaveBeenCalled();
    });

    it('envía la cabecera con salesPerson y los productos confirmados', async () => {
      component.onProductConfirmed({ rowIndex: 0, product: mockProductPlus });
      component.generateQuote();
      await fixture.whenStable();

      expect(setQuotation).toHaveBeenCalledWith({
        header: expect.objectContaining({
          salesPerson: {
            name: 'Ana',
            celPhone: '3001234567',
            position: 'Asesora comercial',
            signatureUrl: 'https://firma.example/ana.png',
          },
        }),
        products: [mockProductPlus],
      });
    });

    it('muestra un error si la generación falla', async () => {
      setQuotation.mockReturnValue(throwError(() => new Error('fallo')));
      component.onProductConfirmed({ rowIndex: 0, product: mockProductPlus });
      component.generateQuote();
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('No se pudo generar la cotización. Intenta de nuevo.');
    });
  });

  describe('sin datos del vendedor', () => {
    let component: QuoteContainerComponent;
    let fixture: ComponentFixture<QuoteContainerComponent>;

    beforeEach(async () => {
      fixture = await setup(null);
      component = fixture.componentInstance;
    });

    it('avisa y no llama al servicio si el vendedor no está listo', async () => {
      component.onProductConfirmed({ rowIndex: 0, product: mockProductPlus });
      component.generateQuote();
      await fixture.whenStable();

      expect(setQuotation).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain('Los datos del vendedor aún no están listos.');
    });
  });
});

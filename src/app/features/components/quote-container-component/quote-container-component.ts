import { afterRenderEffect, Component, computed, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { debounce, form, FormField, maxLength, min, minLength, required } from '@angular/forms/signals';
import {
  LucideBoxes,
  LucideBriefcase,
  LucideBuilding2,
  LucideCalendar,
  LucideCalendarClock,
  LucideFileText,
  LucideHash,
  LucideInfo,
  LucideMapPin,
  LucidePackage,
  LucidePlus,
  LucideTruck,
  LucideUser,
} from '@lucide/angular';
import { Enterprise } from '@shared/models/enterprise-interface';
import { LocalStorageEnum } from '@shared/models/enums';
import { ProductPLus } from '@shared/models/product-interface';
import { QuotationRequest, QuotationSalesPerson, QuoteHeaderForm } from '@shared/models/quotation';
import { User } from '@shared/models/user-interface';
import { CitiesService } from '@shared/services/cities-service';
import { ColorService } from '@shared/services/color-service';
import { CompaniesService } from '@shared/services/companies-service';
import { LocalStorageService } from '@shared/services/local-storage-service';
import { ProductsService } from '@shared/services/products-service';
import { QuotationService } from '@shared/services/quotation-service';
import { UserService } from '@shared/services/user-service';
import 'cally';
import { tap } from 'rxjs';
import { ProductConfirmedEvent, QuoteProductRow } from '../quote-product-row/quote-product-row';
import { QuoteSummary } from '../quote-summary/quote-summary';

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

@Component({
  selector: 'app-quote-container-component',
  imports: [
    FormField,
    QuoteProductRow,
    QuoteSummary,
    LucideFileText,
    LucideBuilding2,
    LucideUser,
    LucideBriefcase,
    LucideHash,
    LucideMapPin,
    LucideCalendar,
    LucideCalendarClock,
    LucideTruck,
    LucideBoxes,
    LucidePackage,
    LucidePlus,
    LucideInfo,
  ],
  templateUrl: './quote-container-component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QuoteContainerComponent {
  private readonly citiesService = inject(CitiesService);
  private readonly companiesService = inject(CompaniesService);
  private readonly productsService = inject(ProductsService);
  private readonly colorService = inject(ColorService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly userService = inject(UserService);
  private readonly quotationService = inject(QuotationService);

  readonly minDate = this.toIsoDate(new Date());

  companies = rxResource({
    stream: () => this.companiesService.getAllCompanies(),
  });

  cities = rxResource({
    stream: () => this.citiesService.getAllCities(),
  });

  products = rxResource({
    stream: () => this.productsService.getAllProducts(),
  });

  colors = rxResource({
    stream: () => this.colorService.getAllColors(),
  });

  userData = rxResource({
    params: () => {
      const id = this.user().id;
      return id > 0 ? id : undefined
    },
    stream: ({params: id}) => this.userService.getUserById(id)
  });

  readonly quotationPdf = rxResource({
    params: () => this.quotationPayload(),
    stream: ({params}) => this.quotationService.setQuotation(params.body).pipe(
      tap((response) => {
        window.open(response.url, '_blank', 'noopener');
      })
    )
  });


  readonly filteredCompanies = computed(() => {
    const query = this.quoteForm.companyName().value().trim().toLowerCase();
    return this.companies.value()?.filter((company) => company.name.toLowerCase().includes(query)) ?? [];
  });

  readonly companyDropdownOpen = signal(false);
  readonly cityId = signal(0);

  readonly user = signal<User>(
    this.localStorageService.getItem<User>(LocalStorageEnum.USER) ?? {
      id: 0,
      name: '',
      email: '',
      role: 'USER',
    },
  );

  private readonly quotationPayload = signal<{ requestId: number; body: QuotationRequest } | undefined>(undefined);
  private nextQuoteRequestId = 0;
  readonly sellerNotice = signal<string | null>(null);

  readonly showCompanyDropdown = computed(
    () => this.companyDropdownOpen() && this.filteredCompanies().length > 0,
  );

  private readonly confirmedByRow = signal<Map<number, ProductPLus>>(new Map());

  readonly productsList = computed(() => [...this.confirmedByRow().values()]);

  readonly productRowIds = signal<number[]>([0]);
  private nextRowId = 1;

  readonly canAddProducts = computed(
    () =>
      this.quoteForm.companyName().valid() &&
      this.quoteForm.name().valid() &&
      this.quoteForm.position().valid() &&
      this.quoteForm.consecutive().valid() &&
      this.quoteForm.city().valid() &&
      this.quoteForm.date().valid(),
  );

  readonly canAddAnotherProduct = computed(() => {
    const lastIndex = this.productRowIds().length - 1;
    return lastIndex >= 0 && this.confirmedByRow().has(lastIndex);
  });

  private readonly quoteLoader = viewChild<ElementRef<HTMLDialogElement>>('quoteLoader');

  private readonly blockUiWhileGenerating = afterRenderEffect({
    write: () => {
      const dialog = this.quoteLoader()?.nativeElement;
      if (!dialog) return;
      if (this.quotationPdf.isLoading()) {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else if (dialog.open) {
        dialog.close();
      }
    }
  });

  formModel = signal<Omit<QuoteHeaderForm, "salesPerson">>({
    name: '',
    companyName: '',
    city: '',
    position: '',
    consecutive: '',
    date: '',
    credit: false,
    daysCredit: 30,
    daysTransport: 15,
    minQuantity: 100
  });

  quoteForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nombre de la persona requerido' });
    minLength(schemaPath.name, 5, { message: 'Minimo cinco caracteres requeridos ' });
    maxLength(schemaPath.name, 150, { message: 'MAximo 150 caracteres' });
    required(schemaPath.position, { message: 'Cargo de la persona requerido' });
    minLength(schemaPath.position, 5, { message: 'Minimo cinco caracteres requeridos ' });
    maxLength(schemaPath.position, 150, { message: 'MAximo 150 caracteres' });
    required(schemaPath.companyName, { message: 'Nombre de la empresa requerido' });
    minLength(schemaPath.companyName, 5, { message: 'Minimo cinco caracteres requeridos ' });
    maxLength(schemaPath.companyName, 150, { message: 'MAximo 150 caracteres' });
    required(schemaPath.consecutive, { message: 'Nombre del consecutivo requerido' });
    minLength(schemaPath.consecutive, 3, { message: 'Minimo tres caracteres requeridos ' });
    maxLength(schemaPath.consecutive, 15, { message: 'MAximo 15 caracteres' });
    required(schemaPath.city, { message: 'Ciudad requeridad' });
    required(schemaPath.date, { message: 'Fecha de la cotizacion' });
    debounce(schemaPath.companyName, 300);
    min(schemaPath.daysCredit, 30, {message: 'Minimo 30 dias para el credito'});
    min(schemaPath.daysTransport, 15, {message: 'Minimo 15 dias para le entrega'});
    min(schemaPath.minQuantity, 100, {message: 'Cantidad minima de producto 100 unidades'});
  });

  openCompanyDropdown(): void {
    if (this.filteredCompanies().length > 0) {
      this.companyDropdownOpen.set(true);
    }
  }

  SetCompany(company: Enterprise): void {
    this.quoteForm.companyName().value.set(company.name);
    this.quoteForm.name().value.set(company.nameAssistant);
    this.quoteForm.city().value.set(company.city.name);
    this.cityId.set(company.city.id);
    this.companyDropdownOpen.set(false);
  }

  onCityChange(cityName: string): void {
    const city = this.cities.value()?.find((c) => c.name === cityName);
    this.cityId.set(city?.id ?? 0);
  }

  onDateChange(event: Event): void {
    const iso = (event.target as HTMLElement & { value: string }).value;
    if (!iso) {
      return;
    }
    this.quoteForm.date().value.set(this.formatSpanishDate(iso));
    (document.activeElement as HTMLElement | null)?.blur();
  }

  onProductConfirmed(event: ProductConfirmedEvent): void {
    this.confirmedByRow.update((map) => {
      const next = new Map(map);
      next.set(event.rowIndex, event.product);
      return next;
    });
  }

  addProduct(): void {
    if (!this.canAddAnotherProduct()) {
      return;
    }
    this.productRowIds.update((ids) => [...ids, this.nextRowId++]);
  }

  generateQuote(): void {
    const products = this.productsList();
    if (products.length === 0 || this.quotationPdf.isLoading()) return;

    const salesPerson = this.toSalesPerson();
    if (!salesPerson) {
      this.sellerNotice.set(
        this.userData.error()
          ? 'No se pudieron cargar los datos del vendedor.'
          : 'Los datos del vendedor aún no están listos.',
      );
      return;
    }

    this.sellerNotice.set(null);
    this.quotationPayload.set({
      requestId: this.nextQuoteRequestId++,
      body: {
        header: {
          ...this.formModel(),
          salesPerson
        },
        products
      }
    });

  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatSpanishDate(iso: string): string {
    const [year, month, day] = iso.split('-').map(Number);
    const paddedDay = String(day).padStart(2, '0');
    return `${paddedDay} de ${MONTHS_ES[month - 1]} de ${year}`;
  }

  private toSalesPerson(): QuotationSalesPerson | null {
    const user = this.userData.value();
    if (!user) return null;
    return {
      name: user.name,
      celPhone: user.phone,
      position: user.position,
      signatureUrl: user.signature,
    }
  }
}

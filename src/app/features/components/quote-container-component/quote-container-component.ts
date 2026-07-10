import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { debounce, form, FormField, maxLength, minLength, required } from '@angular/forms/signals';
import {
  LucideBriefcase,
  LucideBuilding2,
  LucideCalendar,
  LucideFileText,
  LucideHash,
  LucideInfo,
  LucideMapPin,
  LucidePackage,
  LucidePlus,
  LucideUser,
} from '@lucide/angular';
import { Enterprise } from '@shared/models/enterprise-interface';
import { Product } from '@shared/models/product-interface';
import { ColorService } from '@shared/service/color-service';
import { CitiesService } from '@shared/services/cities-service';
import { CompaniesService } from '@shared/services/companies-service';
import { ProductsService } from '@shared/services/products-service';
import 'cally';
import { ProductConfirmedEvent, QuoteProductRow } from '../quote-product-row/quote-product-row';
import { QuoteSummary } from '../quote-summary/quote-summary';

interface QuoteHeaderForm {
  name: string;
  companyName: string;
  consecutive: string;
  date: string;
  city: string;
  position: string;
  credit: boolean;
}

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

  readonly filteredCompanies = computed(() => {
    const query = this.quoteForm.companyName().value().trim().toLowerCase();
    return this.companies.value()?.filter((company) => company.name.toLowerCase().includes(query)) ?? [];
  });

  readonly companyDropdownOpen = signal(false);
  readonly cityId = signal(0);

  readonly showCompanyDropdown = computed(
    () => this.companyDropdownOpen() && this.filteredCompanies().length > 0,
  );

  private readonly confirmedByRow = signal<Map<number, Product>>(new Map());

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

  formModel = signal<QuoteHeaderForm>({
    name: '',
    companyName: '',
    city: '',
    position: '',
    consecutive: '',
    date: '',
    credit: false,
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
    if (products.length === 0) {
      return;
    }
    // TODO: integrar con el servicio de generación de cotización (backend pendiente).
    console.log('Generar cotización', { header: this.formModel(), products });
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
}

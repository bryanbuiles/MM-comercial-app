import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { applyEach, debounce, form, FormField, maxLength, min, minLength, required, SchemaPathTree } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Enterprise } from '@shared/models/enterprise-interface';
import { Product, ProductFormArray, ProductPlus } from '@shared/models/product-interface';
import { AddonService } from '@shared/services/addon-service';
import { CitiesService } from '@shared/services/cities-service';
import { CompaniesService } from '@shared/services/companies-service';
import { FreightService } from '@shared/services/freight-service';
import { ProductsService } from '@shared/services/products-service';


interface ProductForm {
  name: string;
  companyName: string;
  consecutive: string;
  city: string;
  position: string;
  products: ProductFormArray[];
  addonProducts: Omit<ProductFormArray, 'quantity'>[];
}

function ItemSchema(Item: SchemaPathTree<ProductFormArray>) {
  required(Item.nameProduct, { message: 'Campo requerido' });
  required(Item.price, { message: 'campo requerido' });
  required(Item.quantity, { message: 'campo requerido' });
  min(Item.quantity, 1, { message: 'minimo un producto' });
  debounce(Item.nameProduct, 300);
}

@Component({
  selector: 'app-quote-container-component',
  imports: [FormField],
  templateUrl: './quote-container-component.html',
  styleUrl: './quote-container-component.scss',
})
export class QuoteContainerComponent {

  private readonly productService = inject(ProductsService);
  private readonly citiesService = inject(CitiesService);
  private readonly companiesService = inject(CompaniesService);
  private readonly addonService = inject(AddonService);
  private readonly freightService = inject(FreightService);

  Products = rxResource({
    stream: () => this.productService.getAllProducts()
  });

  companies = rxResource({
    stream: () => this.companiesService.getAllCompanies()
  });

  cities = rxResource({
    stream: () => this.citiesService.getAllCities()
  });

  addons = rxResource({
    params: () => {
      const id = this.productId();
      return id > 0 ? id : undefined;
    },
    stream: ({ params: productId }) => this.addonService.getAddonByProduct(productId)
  });

  freight = rxResource({
    params: () => {
      const productId = this.productId();
      const cityId = this.cityId();
      return productId > 0 && cityId > 0
        ? { productId, cityId }
        : undefined;
    },
    stream: ({ params }) =>
      this.freightService.getFreight(params.productId, params.cityId),
  });



  readonly filteredCompanies = computed(() => {
    const query = this.quoteForm.companyName().value().trim().toLowerCase();
    return this.companies.value()?.filter((company) => company.name.toLowerCase().includes(query)) ?? [];
  });

  readonly filteredProducts = computed(() => {
    const products = this.Products.value() ?? [];
    const rows = this.quoteForm.products().value();

    return rows.map((row) => {
      const query = row.nameProduct.trim().toLowerCase();

      return products.filter((product) =>
        product.name.toLowerCase().includes(query),
      );
    });
  });

  readonly companyDropdownOpen = signal(false);
  readonly productDropdownIndex = signal<number | null>(null);
  private readonly blockProductDropdownOpen = signal(false);
  private productId = signal(0);
  private cityId = signal(0);

  readonly showCompanyDropdown = computed(
    () => this.companyDropdownOpen() && this.filteredCompanies().length > 0,
  );
  todayDate = signal<Date>(new Date());

  private readonly confirmedByRow = signal<Map<number, ProductPlus>>(new Map());

  readonly productsList = computed(() => [...this.confirmedByRow().values()]);

  readonly canAddProducts = computed(() =>
    this.quoteForm.companyName().valid() &&
    this.quoteForm.name().valid() &&
    this.quoteForm.position().valid() &&
    this.quoteForm.consecutive().valid() &&
    this.quoteForm.city().valid(),
  );

  readonly canAddAnotherProduct = computed(() => {
    const lastIndex = this.formModel().products.length - 1;
    return lastIndex >= 0 && this.confirmedByRow().has(lastIndex);
  });

  formModel = signal<ProductForm>({
    name: '',
    companyName: '',
    city: '',
    position: '',
    consecutive: '',
    products: [{ productId: 0, nameProduct: '', quantity: 0, price: 0 }],
    addonProducts: [{ productId: 0, nameProduct: '', price: 0 }],
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
    debounce(schemaPath.companyName, 300);
    applyEach(schemaPath.products, ItemSchema)
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

  isRowConfirmed(rowIndex: number): boolean {
    return this.confirmedByRow().has(rowIndex);
  }

  isRowUpToDate(
    productField: (typeof this.quoteForm.products)[number],
    rowIndex: number,
  ): boolean {
    return this.isRowConfirmed(rowIndex) && !productField().dirty();
  }

  hasPendingChanges(
    productField: (typeof this.quoteForm.products)[number],
    rowIndex: number,
  ): boolean {
    return this.isRowConfirmed(rowIndex) && productField().dirty();
  }

  isFreightPendingForRow(rowIndex: number): boolean {
    const row = this.formModel().products[rowIndex];
    const lastIndex = this.formModel().products.length - 1;
    return (
      rowIndex === lastIndex &&
      row.productId > 0 &&
      this.cityId() > 0 &&
      this.freight.isLoading()
    );
  }

  private async resolveFreight(
    productId: number,
    cityId: number,
    fallback: number,
  ): Promise<number> {
    if (productId <= 0 || cityId <= 0) {
      return fallback;
    }

    this.productId.set(productId);

    const resourceReady =
      !this.freight.isLoading() &&
      this.freight.hasValue() &&
      this.productId() === productId &&
      this.cityId() === cityId;

    if (resourceReady) {
      return this.freight.value()!.freight;
    }

    try {
      const data = await firstValueFrom(
        this.freightService.getFreight(productId, cityId),
      );
      return data.freight;
    } catch {
      return fallback;
    }
  }

  showProductDropdown(index: number): boolean {
    return (
      this.productDropdownIndex() === index &&
      (this.filteredProducts()[index]?.length ?? 0) > 0
    );
  }

  openProductDropdown(index: number): void {
    if (this.blockProductDropdownOpen()) return;

    if ((this.filteredProducts()[index]?.length ?? 0) > 0) {
      this.productDropdownIndex.set(index);
    }
  }

  setProduct(
    productField: (typeof this.quoteForm.products)[number],
    product: Product,
  ): void {
    this.blockProductDropdownOpen.set(true);
    this.productDropdownIndex.set(null);
    productField.productId().value.set(product.id);
    productField.nameProduct().value.set(product.name);
    productField.price().value.set(product.originalPrice);
    queueMicrotask(() => this.blockProductDropdownOpen.set(false));
    this.productId.set(product.id);
  }

  async confirmProductRow(
    productField: (typeof this.quoteForm.products)[number],
    rowIndex: number,
  ): Promise<void> {
    productField().markAsTouched();

    if (productField().invalid()) {
      return;
    }

    const row = this.formModel().products[rowIndex];
    const catalogProduct = this.Products.value()?.find((p) => p.id === row.productId);

    if (!catalogProduct) {
      return;
    }

    const resolvedCityId = this.cityId() > 0
      ? this.cityId()
      : (this.cities.value()?.find((c) => c.name === this.quoteForm.city().value())?.id ?? 0);

    this.productId.set(row.productId);

    const freight = await this.resolveFreight(
      row.productId,
      resolvedCityId,
      catalogProduct.freight,
    );

    const productPlus: ProductPlus = {
      ...catalogProduct,
      quantity: productField.quantity().value(),
      freight,
    };

    this.confirmedByRow.update((map) => {
      const next = new Map(map);
      next.set(rowIndex, productPlus);
      return next;
    });

    productField().reset();
  }

  addProduct() {
    this.formModel.update(model => ({
      ...model,
      products: [...model.products, { productId: 0, nameProduct: '', quantity: 0, price: 0 }],
      addonProducts: [...model.addonProducts, { productId: 0, nameProduct: '', price: 0 }],
    }));
  }

}

import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { applyEach, debounce, form, FormField, maxLength, min, minLength, required, SchemaPathTree } from '@angular/forms/signals';
import { Enterprise } from '@shared/models/enterprise-interface';
import { Product, ProductFormArray } from '@shared/models/product-interface';
import { CitiesService } from '@shared/services/cities-service';
import { CompaniesService } from '@shared/services/companies-service';
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

  Products = rxResource({
    stream: () => this.productService.getAllProducts()
  });

  companies = rxResource({
    stream: () => this.companiesService.getAllCompanies()
  });

  cities = rxResource({
    stream: () => this.citiesService.getAllCities()
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

  readonly showCompanyDropdown = computed(
    () => this.companyDropdownOpen() && this.filteredCompanies().length > 0,
  );
  todayDate = signal<Date>(new Date());

  productsList = signal<Product[]>([]);

  formModel = signal<ProductForm>({
    name: '',
    companyName: '',
    city: '',
    position: '',
    consecutive: '',
    products: [{ nameProduct: '', quantity: 0, price: 0 }],
    addonProducts: [{ nameProduct: '', price: 0 }]
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
    this.companyDropdownOpen.set(false);
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
    productField.nameProduct().value.set(product.name);
    productField.price().value.set(product.originalPrice);
    queueMicrotask(() => this.blockProductDropdownOpen.set(false));
    this.productsList.set([...this.productsList(), product]);
  }

  addProduct() {
    this.formModel.update(model => ({
      ...model,
      products: [...model.products, { nameProduct: '', quantity: 0, price: 0 }],
      addonProducts: [...model.addonProducts, { nameProduct: '', price: 0 }],
    }));
  }

}

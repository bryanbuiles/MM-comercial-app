import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField, min, required } from '@angular/forms/signals';
import {
  LucideBanknote,
  LucideBox,
  LucideCircleCheck,
  LucidePalette,
  LucideSearch,
  LucideTriangleAlert,
} from '@lucide/angular';
import { Addon } from '@shared/models/addon-interface';
import { Color } from '@shared/models/color-interface';
import { Product, ProductFormArray, ProductType } from '@shared/models/product-interface';
import { AddonService } from '@shared/services/addon-service';
import { FreightService } from '@shared/services/freight-service';

export interface ProductConfirmedEvent {
  rowIndex: number;
  product: Product;
}

@Component({
  selector: 'app-quote-product-row',
  imports: [
    FormField,
    CurrencyPipe,
    LucideSearch,
    LucidePalette,
    LucideBanknote,
    LucideBox,
    LucideCircleCheck,
    LucideTriangleAlert,
  ],
  templateUrl: './quote-product-row.html',
})
export class QuoteProductRow {
  private readonly freightService = inject(FreightService);
  private readonly addonService = inject(AddonService);

  readonly rowIndex = input.required<number>();
  readonly cityId = input.required<number>();
  readonly catalog = input<Product[]>([]);
  readonly colors = input<Color[]>([]);

  readonly productConfirmed = output<ProductConfirmedEvent>();

  readonly addons = rxResource({
    params: () => {
      const id = this.selectedProduct()?.id ?? 0;
      return id > 0 ? id : undefined;
    },
    stream: ({ params: productId }) => this.addonService.getAddonByProduct(productId),
  });

  readonly freight = rxResource({
    params: () => {
      const productId = this.selectedProduct()?.id;
      return productId ? { productId, cityId: this.cityId() } : undefined;
    },
    stream: ({ params }) =>
      this.freightService.getFreight(params.productId, params.cityId),
  });

  readonly productSearchQuery = signal('');
  readonly dropdownFocused = signal(false);
  readonly selectedProduct = signal<Product | null>(null);
  readonly rowConfirmed = signal(false);
  private blurTimeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly filteredProducts = computed(() => {
    const query = this.productSearchQuery().trim().toLowerCase();
    return this.catalog().filter((product) =>
      product.name.toLowerCase().includes(query),
    );
  });

  readonly showProductDropdown = computed(
    () => this.dropdownFocused() && this.filteredProducts().length > 0,
  );

  readonly formModel = signal<ProductFormArray>({
    productId: 0,
    nameProduct: '',
    color: '',
    price: 0,
    isRestore: false,
    liner: false,
    tap: false,
    strap: false,
    decoration: false,
    addonProducts: [
      { productId: 0, nameProduct: '', price: 0, type: 'TAPA' },
      { productId: 0, nameProduct: '', price: 0, type: 'LINER' },
      { productId: 0, nameProduct: '', price: 0, type: 'MANIJA' },
      { productId: 0, nameProduct: '', price: 0, type: 'DECORATION' }
    ],
  });


  readonly productForm = form(this.formModel, (schemaPath) => {
    min(schemaPath.productId, 1, { message: 'Seleccione un producto' });
    required(schemaPath.color, { message: 'Color requerido' });
    required(schemaPath.price, { message: 'campo requerido' });
  });

  readonly hasRestorePrice = computed(
    () => this.selectedProduct()?.originalPriceRestore != null,
  );

  readonly canConfirmProduct = computed(
    () =>
      !!this.selectedProduct() &&
      !this.freight.isLoading() &&
      this.freight.hasValue() &&
      !this.freight.error(),
  );

  readonly isRowUpToDate = computed(
    () => this.rowConfirmed() && !this.productForm().dirty(),
  );

  readonly hasPendingChanges = computed(
    () => this.rowConfirmed() && this.productForm().dirty(),
  );

  readonly totalPrice = computed(() => {
    const productPrice = this.productForm.price().value();
    const freight = this.freight.value()?.freight ?? 0;
    const addonsPrice = this.productForm.addonProducts().value().reduce((acc, item) => acc + item.price, 0);
    return productPrice + addonsPrice + freight;
  });


  onProductSearchFocus(): void {
    if (this.blurTimeoutId) {
      clearTimeout(this.blurTimeoutId);
      this.blurTimeoutId = null;
    }
    this.dropdownFocused.set(true);
  }

  onProductSearchBlur(): void {
    this.blurTimeoutId = setTimeout(() => {
      this.dropdownFocused.set(false);
    }, 150);
  }

  onChangeSelect(addonId: string, type: ProductType): void {
    const id = Number(addonId);
    const selected = this.addons.value()?.find((a) => a.id === id);
    if (!selected) return;

    const isRestore = this.productForm.isRestore().value();
    const price =
      isRestore && selected.originalPriceRestore != null
        ? selected.originalPriceRestore
        : selected.originalPrice;

    this.formModel.update((model) => ({
      ...model,
      addonProducts: model.addonProducts.map((addon) =>
        addon.type === type
          ? {
            ...addon,
            productId: selected.addonProductId,
            nameProduct: selected.addonName,
            price,
          }
          : addon,
      ),
    }));
  }

  readonly addonsGrouped = computed(() => {
    const grouped = new Map<ProductType, Addon[]>();
    if (!this.addons.hasValue()) return grouped;

    for (const addon of this.addons.value()!) {
      const list = grouped.get(addon.type) ?? [];
      list.push(addon);
      grouped.set(addon.type, list);
    }
    return grouped;
  });

  onProductSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.productSearchQuery.set(value);

    if (this.selectedProduct()?.name !== value) {
      this.selectedProduct.set(null);
      this.productForm.productId().value.set(0);
    }

    this.dropdownFocused.set(true);
  }

  setProduct(product: Product): void {
    if (this.blurTimeoutId) {
      clearTimeout(this.blurTimeoutId);
      this.blurTimeoutId = null;
    }

    this.dropdownFocused.set(false);
    this.selectedProduct.set(product);
    this.productForm.productId().value.set(product.id);
    this.productForm.nameProduct().value.set(product.name);
    if (product.originalPriceRestore == null) {
      this.productForm.isRestore().value.set(false);
    }
    this.applyPriceFromCatalog(product);
    if (product.color) {
      this.productForm.color().value.set(product.color);
    }

    this.productSearchQuery.set(product.name);
  }

  onRestoreToggle(): void {
    const product = this.selectedProduct();
    if (!product) {
      return;
    }
    this.applyPriceFromCatalog(product);
  }

  confirmProduct(): void {
    this.productForm().markAsTouched();

    if (this.productForm().invalid()) {
      return;
    }

    const catalogProduct = this.selectedProduct();
    if (!catalogProduct || !this.freight.hasValue()) {
      return;
    }

    const productPlus: Product = {
      ...catalogProduct,
      color: this.productForm.color().value(),
      originalPrice: this.totalPrice()
    };

    this.rowConfirmed.set(true);
    this.productConfirmed.emit({ rowIndex: this.rowIndex(), product: productPlus });
    this.productForm().reset();
  }

  private applyPriceFromCatalog(product: Product): void {
    const isRestore = this.productForm.isRestore().value();
    this.productForm.price().value.set(
      isRestore ? (product.originalPriceRestore ?? product.originalPrice) : product.originalPrice,
    );
  }


}

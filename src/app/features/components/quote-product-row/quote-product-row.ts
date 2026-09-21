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
import { Product, ProductFormArray, ProductPLus, ProductType } from '@shared/models/product-interface';
import { AddonService } from '@shared/services/addon-service';
import { FreightService } from '@shared/services/freight-service';

export interface ProductConfirmedEvent {
  rowIndex: number;
  product: ProductPLus;
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


  readonly restoreTYpes = [{
    name: 'Material nuevo',
    value: 'ORIGINAL'
  },
  {
    name: 'Material recuperado',
    value: 'RESTORE'
  },
  {
    name: 'AMBOS',
    value: 'BOTH'
  },
]

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
    originalPrice: 0,
    originalPriceRestore: 0,
    restoreType: 'ORIGINAL',
    liner: false,
    tap: false,
    strap: false,
    decoration: false,
    addonProducts: [
      { productId: 0, nameProduct: '', originalPrice: 0, originalPriceRestore: 0, type: 'TAPA' },
      { productId: 0, nameProduct: '',originalPrice: 0, originalPriceRestore: 0, type: 'LINER' },
      { productId: 0, nameProduct: '', originalPrice: 0, originalPriceRestore: 0,type: 'MANIJA' },
      { productId: 0, nameProduct: '', originalPrice: 0, originalPriceRestore: 0, type: 'DECORATION' }
    ],
  });


  readonly productForm = form(this.formModel, (schemaPath) => {
    min(schemaPath.productId, 1, { message: 'Seleccione un producto' });
    required(schemaPath.color, { message: 'Color requerido' });
    required(schemaPath.originalPrice, { message: 'campo requerido' });
    required(schemaPath.originalPriceRestore, { message: 'campo requerido' });
    required(schemaPath.restoreType, { message: 'campo requerido' });
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
    const productPrice = this.productForm.originalPrice().value();
    const freight = this.freight.value()?.freight ?? 0;
    const addonsPrice = this.productForm.addonProducts().value().reduce((acc, item) => acc + item.originalPrice, 0);
    return productPrice + addonsPrice + freight;
  });

  readonly totalPriceRestore = computed(() => {
    if (this.hasRestorePrice()) {
      const productPrice = this.productForm.originalPriceRestore().value();
      const freight = this.freight.value()?.freight ?? 0;
      const addonsPrice = this.productForm.addonProducts().value().reduce((acc, item) => acc + item.originalPriceRestore, 0);
      return productPrice + addonsPrice + freight;
    }
    return 0;
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

    this.formModel.update((model) => ({
      ...model,
      addonProducts: model.addonProducts.map((addon) =>
        addon.type === type
          ? {
            ...addon,
            productId: selected.addonProductId,
            nameProduct: selected.addonName,
            originalPrice: selected.originalPrice,
            originalPriceRestore: selected.originalPriceRestore ?? 0
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
      this.productForm.restoreType().value.set('ORIGINAL');
    }
    if (product.color) {
      this.productForm.color().value.set(product.color);
    }
    this.applyPriceFromCatalog(product);
    this.productSearchQuery.set(product.name);
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

    const productPlus: ProductPLus = {
      ...catalogProduct,
      color: this.productForm.color().value(),
      originalPrice: this.totalPrice(),
      originalPriceRestore:this.totalPriceRestore(),
      addonProducts: this.productForm.addonProducts().value(),
      restoreType: this.productForm.restoreType().value()
    };

    this.rowConfirmed.set(true);
    this.productConfirmed.emit({ rowIndex: this.rowIndex(), product: productPlus });
    this.productForm().reset();
  }

  private applyPriceFromCatalog(product: Product): void {
    this.productForm.originalPrice().value.set(product.originalPrice);
    if (product.originalPriceRestore) this.productForm.originalPriceRestore().value.set(product.originalPriceRestore);
  }
}

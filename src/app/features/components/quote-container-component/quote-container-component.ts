import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, required } from '@angular/forms/signals';
import { Product } from '@shared/models/product-interface';
import { ProductsService } from '@shared/services/products-service';

interface ProductForm {
  name: string;
  companyName: string;
  consecutive: string;
  city: string;
  products: Product[];
}

@Component({
  selector: 'app-quote-container-component',
  imports: [],
  templateUrl: './quote-container-component.html',
  styleUrl: './quote-container-component.scss',
})
export class QuoteContainerComponent {

  private readonly productService = inject(ProductsService);

  Products = rxResource({
    stream: () => this.productService.getAllProducts()
  });

  formModel = signal<ProductForm>({
    name: '',
    companyName: '',
    city: '',
    consecutive: '',
    products: []
  });

  quoteForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.name, { message: 'Nombre de la mepresa requerido' })
  })


  todayDate = signal<Date>(new Date());

}

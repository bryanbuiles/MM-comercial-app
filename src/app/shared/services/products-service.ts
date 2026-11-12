import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { Product } from '@shared/models/product-interface';

@Service()
export class ProductsService {

    private readonly http = inject(HttpClient);

    getAllProducts() {
        return this.http.get<Product[]>(`${environment.apiUrl}/products`);
    }
}

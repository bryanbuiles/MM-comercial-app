import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { Addon } from '@shared/models/addon-interface';
import { ProductType } from '@shared/models/product-interface';

@Service()
export class AddonService {

    private readonly http = inject(HttpClient);

    getAddonByProduct(productId: number, type?: ProductType) {
        let params = new HttpParams();
        params = params.set('productId', productId);
        if (type) params = params.set('type', type);
        return this.http.get<Addon[]>(`${environment.apiUrl}/addon`, { params });
    }

}

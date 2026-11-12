import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { Freight } from '@shared/models/freight-interface';

@Service()
export class FreightService {

    private readonly http = inject(HttpClient);

    getFreight(productId: number, cityId: number) {
        let params = new HttpParams();
        params = params.set('productId', productId);
        params = params.set('cityId', cityId);
        return this.http.get<Freight>(`${environment.apiUrl}/freight`, { params });
    }

}

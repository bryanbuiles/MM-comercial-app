import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { Addon } from '@shared/models/addon-interface';

@Service()
export class AddonService {

    private readonly http = inject(HttpClient);

    getAddonByProduct(productId: number) {
        return this.http.get<Addon[]>(`${environment.apiUrl}/addon/${productId}`);
    }

}

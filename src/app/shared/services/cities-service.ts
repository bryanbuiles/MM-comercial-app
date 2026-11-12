import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { City } from '@shared/models/city-interface';

@Service()
export class CitiesService {

    private readonly http = inject(HttpClient);

    getAllCities() {
        return this.http.get<City[]>(`${environment.apiUrl}/cities`)
    }
}

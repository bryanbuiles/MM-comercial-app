import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { Enterprise } from '@shared/models/enterprise-interface';

@Service()
export class CompaniesService {
    private readonly http = inject(HttpClient);

    getAllCompanies() {
        return this.http.get<Enterprise[]>(`${environment.apiUrl}/companies`);
    }
}

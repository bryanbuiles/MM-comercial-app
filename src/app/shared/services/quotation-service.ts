import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { QuotationRequest, QuotationResponse } from '@shared/models/quotation';

@Service()
export class QuotationService {

    private readonly http = inject(HttpClient);

    setQuotation(body: QuotationRequest) {
        return this.http.post<QuotationResponse>(`${environment.apiUrl}/quotations/pdf`, body);
    }
}

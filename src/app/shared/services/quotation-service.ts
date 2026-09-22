import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { QuotationResponse, QuoteHeaderForm } from '@shared/models/quotation';

@Service()
export class QuotationService {

    private readonly http = inject(HttpClient);

    setQuotation(body:QuoteHeaderForm) {
        return this.http.post<QuotationResponse>(`${environment.apiUrl}/quotations/pdf`, body);
    }
}

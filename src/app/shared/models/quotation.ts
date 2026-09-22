import { ProductPLus } from "@shared/models/product-interface";

export interface QuoteHeaderForm {
    name: string;
    companyName: string;
    consecutive: string;
    date: string;
    city: string;
    position: string;
    credit: boolean;
    daysCredit: number,
    daysTransport: number,
    minQuantity: number,
    salesPerson: QuotationSalesPerson
  }

export interface QuotationSalesPerson {
    name: string,
    celPhone: string,
    position: string,
    signatureUrl: string
}

export interface QuotationRequest {
    header: QuoteHeaderForm,
    products: ProductPLus
}

export interface QuotationResponse {
    url: string;
    fileName: string;
    expiresInSeconds: number;
}

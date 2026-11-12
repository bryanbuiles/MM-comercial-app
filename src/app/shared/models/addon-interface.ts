import { ProductType } from "@shared/models/product-interface";

export interface Addon {
    id: number;
    addonProductId: number;
    addonName: string;
    type: ProductType;
    originalPrice: number;
    originalPriceRestore?: number;
}

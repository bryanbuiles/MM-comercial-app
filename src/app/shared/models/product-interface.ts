export type ProductType =
    'CUÑETE' |
    'GARRAFA' |
    'ENVASE' |
    'BOTELLA' |
    'TAPA' |
    'LINER' |
    'MANIJA' |
    'DECORATION'

export interface Product {
    id: number;
    name: string;
    description: string;
    image: string;
    dimensions: string;
    weight: string;
    color?: string;
    package: number;
    material: string;
    neckSize: string;
    type: ProductType;
    originalPrice: number;
    originalPriceRestore?: number;
}

export interface AddonProduct extends Omit<ProductFormArray,
    'restoreType' | 'addonProducts' | 'color' | 'tap' | 'decoration' | 'liner' | 'strap'> {
    type: ProductType
}

export interface ProductPLus extends Product {
    addonProducts: AddonProduct[];
    restoreType: Restore;
}

export type Restore = 'ORIGINAL' | 'RESTORE' | 'BOTH';

export interface ProductFormArray {
    productId: number;
    nameProduct: string;
    originalPrice: number;
    originalPriceRestore: number;
    restoreType: Restore;
    color: string;
    tap: boolean;
    decoration: boolean;
    liner: boolean;
    strap: boolean;
    addonProducts: AddonProduct[];
}



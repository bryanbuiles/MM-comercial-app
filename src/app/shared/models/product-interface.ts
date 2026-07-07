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
    'isRestore' | 'addonProducts' | 'color' | 'tap' | 'decoration' | 'liner' | 'strap'> {
    type: ProductType
}

export interface ProductFormArray {
    productId: number;
    nameProduct: string;
    price: number;
    isRestore: boolean;
    color: string;
    tap: boolean;
    decoration: boolean;
    liner: boolean;
    strap: boolean;
    addonProducts: AddonProduct[];
}



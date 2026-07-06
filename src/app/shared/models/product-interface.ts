export type ProductType =
    'CUÑETE' |
    'GARRAFA' |
    'ENVASE' |
    'BOTELLA' |
    'TAPA' |
    'LINER' |
    'DECORATION' |
    'MANIJA'

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

export interface ProductPlus extends Product {
    quantity: number;
    freight: number;
}
export interface AddonProduct extends Omit<ProductFormArray, 'quantity' | 'isRestore' | 'addonProducts' | 'color'> {
}

export interface ProductFormArray {
    productId: number;
    nameProduct: string;
    quantity: number;
    price: number;
    isRestore: boolean;
    color: string;
    addonProducts: AddonProduct[];
}



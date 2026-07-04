export interface Product {
    id: number;
    name: string;
    description: string;
    image: string;
    dimensions: string;
    weight: string;
    material: string;
    neckSize: string;
    type: 'CUÑETE' |
    'GARRAFA' |
    'ENVASE' |
    'BOTELLA' |
    'TAPA' |
    'LINER' |
    'DECORATION';
    originalPrice: number;
    originalPriceRestore: number;
    freight: number;
}

export interface ProductPlus extends Product {
    quantity: number;
    freight: number;
}

export interface ProductFormArray {
    productId: number;
    nameProduct: string;
    quantity: number;
    price: number;
}


import { City } from '@shared/models/city-interface';

export interface Enterprise {
    id: number;
    name: string;
    nameAssistant: string;
    phone: string;
    address: string;
    city: City;
}

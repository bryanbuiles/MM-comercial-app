export interface User {
    id: number;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

export interface UserPLus extends User {
    phone: string;
    position: string;
    signature: string
}

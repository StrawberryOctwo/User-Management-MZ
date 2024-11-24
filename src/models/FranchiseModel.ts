// src/models/FranchiseModel.ts

export interface Admin {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    postalCode: string;
    phoneNumber: number;
}

export interface Location {
    id: number;
    name: string;
    address: string;
    postalCode: string;
}

export interface Franchise {
    id: number;
    name: string;
    ownerName: string;
    cardHolderName: string;
    iban: string;
    bic: string;
    status: string;
    totalEmployees: number;
    createdAt: string;
    admins?: Admin[]; // Optional: In case admins data isn't always present
    locations?: Location[]; // Optional: In case locations data isn't always present
}

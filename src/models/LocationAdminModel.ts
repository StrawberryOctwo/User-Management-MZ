// LocationAdminModel.ts

export interface LocationAdmin {
    id: number;
    firstName: string;
    lastName: string;
    dob: string; // Date of birth, consider using Date type if needed
    email: string;
    address: string;
    postalCode: string;
    phoneNumber: number;
    locationNames: string[]; // Array of location names the admin manages
  }
  
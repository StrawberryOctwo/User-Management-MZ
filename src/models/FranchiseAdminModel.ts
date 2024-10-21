export interface FranchiseAdmin {
    id: number;
    firstName: string;
    lastName: string;
    dob: string; // You could use Date type if necessary
    email: string;
    address: string;
    postalCode: string;
    phoneNumber: string;
    franchiseNames: string[]; // Assuming a list of franchises they manage
  }
  
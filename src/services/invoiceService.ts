import { api } from "./api";


// Fetch all invoices for a specific user
export const fetchUserInvoices = async (userId: number, page: number, limit: number) => {
  try {
    const response = await api.get(`/invoices/user/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user invoices:', error);
    throw new Error('Could not fetch invoices.');
  }
};

// Fetch a single invoice by its ID
export const fetchInvoiceById = async (invoiceId: number, userId: number) => {
  try {
    const response = await api.get(`/invoices/${invoiceId}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice by ID:', error);
    throw new Error('Could not fetch invoice details.');
  }
};

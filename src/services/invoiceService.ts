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

export const fetchDailyInvoicesForFranchise = async (
  startDate: string,

) => {
  try {
    const response = await api.post(
      `/invoices/franchise/download`,
      { startDate },

    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching daily invoices for franchise:', error);
    throw new Error('Could not fetch daily invoices.');
  }
}
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

import { api } from './api'; // Assuming you have an API instance

// Fetch all billings with pagination
export const fetchAllBillings = async (page: number, limit: number, searchQuery: string = '') => {
  try {
    const response = await api.get('/billings', {
      params: { page, limit, searchQuery },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching billings:', error);
    throw error;
  }
};

// Submit a new billing
export const submitBilling = async (payload: { revenue: number; franchiseId: number }) => {
  try {
    const response = await api.post('/billings/submit', payload);
    return response.data;
  } catch (error) {
    console.error('Error submitting billing:', error);
    throw error;
  }
};


// Confirm billing as paid
export const confirmBillingAsPaid = async (billingId: number, isPaid: boolean) => {
  try {
    const response = await api.post(`/billings/confirm`, { billingId, isPaid });
    return response.data;
  } catch (error) {
    console.error('Error confirming billing as paid:', error);
    throw error;
  }
};

// Download billing invoice
export const downloadBillingInvoice = async (billingId: number) => {
  try {
    const response = await api.get(`/billings/${billingId}/download`, {
      responseType: 'blob', // Expecting a file (PDF)
    });

    // Create a blob URL for the PDF file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice_${billingId}.pdf`); // Name the downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

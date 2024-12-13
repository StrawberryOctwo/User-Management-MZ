import React, { useEffect, useState } from 'react';
import { fetchInvoiceById } from 'src/services/invoiceService';
import { useAuth } from 'src/hooks/useAuth';
import generateInvoicePDF from 'src/content/applications/Invoices/teacherInvoice';
import { t } from "i18next"

export default function InvoiceComponent() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const { userId } = useAuth();

  // Fetch invoice data when selectedInvoiceId changes
  useEffect(() => {
    const loadInvoiceData = async () => {
      if (selectedInvoiceId && userId) {
        try {
          const data = await fetchInvoiceById(selectedInvoiceId, userId);
          setInvoiceData(data);
        } catch (error) {
          console.error('Error fetching invoice:', error);
        }
      }
    };
    loadInvoiceData();
  }, [selectedInvoiceId, userId]);

  // Generate PDF once invoice data is loaded
  useEffect(() => {
    if (invoiceData) {
      // generateInvoicePDF(invoiceData);
      setInvoiceData(null); // Reset invoice data after generating the PDF to avoid repeated generation
    }
  }, [invoiceData]);

  // Example function to trigger PDF generation for a specific invoice
  const handleDownloadInvoice = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
  };

  return (
    <div>
      <button onClick={() => handleDownloadInvoice(123)}>{t("download_invoice_pdf")}</button>
    </div>
  );
}

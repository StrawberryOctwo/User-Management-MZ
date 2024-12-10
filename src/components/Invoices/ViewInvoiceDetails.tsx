import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, CircularProgress } from '@mui/material';
import { fetchInvoiceById } from 'src/services/invoiceService';
import { t } from "i18next"

interface ViewInvoiceDetailsProps {
  isOpen: boolean;
  invoiceId: number;
  userId: number;
  onClose: () => void;
}

export default function ViewInvoiceDetails({
  isOpen,
  invoiceId,
  userId,
  onClose,
}: ViewInvoiceDetailsProps) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoiceDetails();
    }
  }, [isOpen, invoiceId]);

  const loadInvoiceDetails = async () => {
    setLoading(true);
    try {
      const data = await fetchInvoiceById(invoiceId, userId);
      setInvoice(data);
    } catch (error) {
      setErrorMessage('Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("invoice_details")}</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : errorMessage ? (
          <div>{errorMessage}</div>
        ) : (
          <div>
            <p><strong>{t("invoice_id")}</strong> {invoice.invoiceId}</p>
            <p><strong>{t("invototal_amountice_details")}:</strong> ${invoice.totalAmount}</p>
            <p><strong>{t("extra_amount")}:</strong> ${invoice.extraAmount}</p>
            <p><strong>{t("status")}:</strong> {invoice.status}</p>
            <p><strong>{t("created_at")}:</strong> {new Date(invoice.createdAt).toLocaleString()}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

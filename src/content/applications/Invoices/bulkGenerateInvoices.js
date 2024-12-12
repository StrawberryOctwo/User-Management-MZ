// src/utils/bulkGenerateInvoices.ts

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SEPA from 'sepa';
import { fetchTeacherInvoiceInfoByUserId } from 'src/services/teacherService'; // Adjust the import path as needed

/**
 * Generates a PDF and SEPA XML Blob for a Parent Invoice.
 *
 * @param {Object} invoice - The parent invoice data.
 * @returns {Promise<{ pdf: Blob; sepa: Blob }>} - The generated PDF and SEPA XML as Blobs.
 */
export const generateParentInvoiceBlobs = async (invoice) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Helper Functions
  const formatDate = (date) => new Date(date).toLocaleDateString('de-DE');
  const formatCurrency = (amount) => `€${Number(amount).toFixed(2)}`;
  const loadImage = (src) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Extracting necessary details
  const invoiceDate = formatDate(invoice.createdAt);
  const monthYear = new Date(invoice.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
  const studentName = `${invoice.student.user.firstName} ${invoice.student.user.lastName}`;
  const parentName = `${invoice.user.firstName} ${invoice.user.lastName}`;
  const parentAccountHolder = invoice.student.parent.accountHolder;
  const parentAddress = invoice.user.address || 'N/A';
  const parentPostalCode = invoice.user.postalCode || 'N/A';
  const parentIban = invoice.student.parent.iban || 'N/A';
  const parentBic = invoice.student.parent.bic || null;
  const totalAmount = formatCurrency(invoice.totalAmount);
  const franchise = invoice.student.locations[0]?.franchise || {};
  const franchiseIban = franchise.iban;
  const franchiseBic = parentBic ? franchise.bic : null;

  // Header Section: Invoice Info and Logo
  try {
    if (franchise.franchiseLogo) {
      const logo = await loadImage(franchise.franchiseLogo);
      const canvas = document.createElement('canvas');
      canvas.width = logo.width;
      canvas.height = logo.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(logo, 0, 0);
      const logoDataURL = canvas.toDataURL('image/png');
      doc.addImage(logoDataURL, 'PNG', 150, 10, 26, 26);
    }
  } catch (error) {
    console.warn('Franchise logo could not be loaded:', error);
  }

  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(33, 37, 41);
  doc.text('Rechnung', 15, 20);

  doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(99, 110, 114);
  doc.text(`Rechnung Nr.: ${invoice.invoiceId}`, 15, 28);
  doc.text(`Datum: ${invoiceDate}`, 15, 34);

  // Separation Line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(15, 40, 195, 40);

  // Parent and Franchise Details
  const startY = 50;

  doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor(33, 37, 41);
  doc.text('Eltern Details', 15, startY);

  doc.setFontSize(12).setFont('helvetica', 'normal');
  doc.text(`Name: ${parentName}`, 15, startY + 6);
  doc.text(`Adresse: ${parentAddress}`, 15, startY + 12);
  doc.text(`Postleitzahl: ${parentPostalCode}`, 15, startY + 18);

  doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor(33, 37, 41);
  doc.text('Franchise Details', 15, startY + 30);

  doc.setFontSize(12).setFont('helvetica', 'normal');
  doc.text(franchise.name || 'Franchise nicht verfügbar', 15, startY + 36);
  doc.text(franchise.address || 'Adresse nicht verfügbar', 15, startY + 42);
  doc.text(
    `${franchise.postalCode || ''} ${franchise.city || ''}`.trim(),
    15,
    startY + 48
  );

  // Invoice Information
  const invoiceInfoY = startY + 60;
  doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0, 102, 204);
  doc.text(`Rechnung für ${studentName} (${monthYear})`, 15, invoiceInfoY);

  doc.setFontSize(12).setFont('helvetica', 'normal').setTextColor(33, 37, 41);
  doc.text('Sehr geehrte Damen und Herren,', 15, invoiceInfoY + 10);
  doc.text(
    `hiermit stellen wir Ihnen für ${studentName} in dem Monat ${monthYear} folgende Rechnung aus:`,
    15,
    invoiceInfoY + 16
  );

  doc.setFont('italic').setTextColor(99, 110, 114);
  doc.text('Umsatzsteuerfreie Leistung gemäß § 4 Nr. 21b UStG.', 15, invoiceInfoY + 24);

  // Table Section
  const tableColumns = ['Datum', 'Unterrichtstyp', 'Dauer (Stunden)', 'Betrag (€)'];
  const tableRows = invoice.payments.map((payment) => [
    formatDate(payment.session.date),
    payment.session.sessionType.name || 'Nicht definiert',
    (payment.session.duration / 60).toFixed(2),
    formatCurrency(payment.amount),
  ]);

  if (invoice.oneTimeFee > 0) {
    tableRows.push(['+ Materialkosten', '', '', formatCurrency(invoice.oneTimeFee)]);
  }
  if (invoice.monthlyFee > 0) {
    tableRows.push(['+ Monatsgebühr', '', '', formatCurrency(invoice.monthlyFee)]);
  }
  tableRows.push(['Gesamtsumme', '', '', totalAmount]);

  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: invoiceInfoY + 30,
    styles: { halign: 'right', fontSize: 10 },
    headStyles: { fillColor: [230, 230, 230], textColor: 33 },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'left' },
    },
  });

  // Payment Information
  const paymentInfoY = (doc).lastAutoTable.finalY + 10;
  doc.setFontSize(12).setFont('helvetica', 'normal').setTextColor(33, 37, 41);
  doc.text(`Der Betrag wird am ${invoiceDate} von Ihrem Konto abgebucht.`, 15, paymentInfoY);
  doc.text(`IBAN: ${parentIban}`, 15, paymentInfoY + 6);
  doc.text(
    'Hinweis: Bitte sorgen Sie für eine positive Kontodeckung. Wir berechnen zusätzliche Gebühren bei Rücklastschriften.',
    15,
    paymentInfoY + 12,
    { maxWidth: 180 }
  );

  // SEPA XML Generation
  const sepaDoc = new SEPA.Document('pain.008.001.08');
  sepaDoc.grpHdr.id = `INV-${invoice.invoiceId}`;
  sepaDoc.grpHdr.created = new Date(invoice.createdAt);
  sepaDoc.grpHdr.initiatorName = franchise.name;

  const paymentInfoSEPA = sepaDoc.createPaymentInfo();
  paymentInfoSEPA.collectionDate = new Date(invoice.createdAt);
  paymentInfoSEPA.creditorIBAN = franchiseIban;
  if (parentBic) {
    paymentInfoSEPA.creditorBIC = franchiseBic;
  }
  paymentInfoSEPA.creditorName = franchise.name;
  sepaDoc.addPaymentInfo(paymentInfoSEPA);

  const transaction = paymentInfoSEPA.createTransaction();
  transaction.debtorName = parentAccountHolder;
  transaction.debtorIBAN = parentIban;
  if (parentBic) {
    transaction.debtorBIC = parentBic;
  }
  transaction.mandateId = `MANDATE-${invoice.invoiceId}`;
  transaction.mandateSignatureDate = new Date(invoice.createdAt);
  transaction.amount = Number(invoice.totalAmount);
  transaction.currency = 'EUR';
  transaction.remittanceInfo = `Rechnung ${invoice.invoiceId}`;
  transaction.end2endId = `INV-${invoice.invoiceId}`;
  paymentInfoSEPA.addTransaction(transaction);

  const sepaXML = sepaDoc.toString();

  // Footer Section
  const closingY = paymentInfoY + 30;
  doc.setFontSize(12).setFont('helvetica', 'italic').setTextColor(99, 110, 114);
  doc.text(
    '„Für eine verbesserte Klausurvorbereitung möchten wir gerne mit den jeweiligen Fachlehrern in der Schule in Kontakt treten. Wenn das erwünscht ist, melden Sie sich doch bitte bei uns.“',
    15,
    closingY,
    { maxWidth: 180 }
  );

  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(33, 37, 41);
  doc.text('Mit freundlichen Grüßen', 105, closingY + 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('- Empfehlen Sie uns an Ihre Freunde & Familie weiter -', 105, closingY + 26, { align: 'center' });

  // Convert PDF to Blob
  const pdfBlob = await doc.output('blob');

  // Convert SEPA XML to Blob
  const sepaBlob = new Blob([sepaXML], { type: 'application/xml' });

  return { pdf: pdfBlob, sepa: sepaBlob };
};

/**
 * Generates a PDF and SEPA XML Blob for a Teacher Invoice.
 *
 * @param {Object} invoice - The teacher invoice data.
 * @param {Object} teacher - The teacher data.
 * @returns {Promise<{ pdf: Blob; sepa: Blob }>} - The generated PDF and SEPA XML as Blobs.
 */
export const generateTeacherInvoiceBlobs = async (invoice, teacher) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Helper Functions
  const formatDate = (date) => new Date(date).toLocaleDateString('de-DE');
  const formatCurrency = (amount) => `€${Number(amount).toFixed(2)}`;
  const loadImage = (src) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Extracting necessary details
  const invoiceDate = formatDate(invoice.createdAt);
  const monthYear = new Date(invoice.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
  const hoursWorked = (invoice.totalAmount / teacher.hourlyRate).toFixed(2);
  const currentDate = formatDate(new Date());

  // Header Section: Invoice Info and Logo
  try {
    if (teacher.locations[0].franchise.franchiseLogo) {
      const logo = await loadImage(teacher.locations[0].franchise.franchiseLogo);
      const canvas = document.createElement('canvas');
      canvas.width = logo.width;
      canvas.height = logo.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(logo, 0, 0);
      const logoDataURL = canvas.toDataURL('image/png');
      doc.addImage(logoDataURL, 'PNG', 150, 10, 26, 26);
    }
  } catch (error) {
    console.warn('Teacher logo could not be loaded:', error);
  }

  // Title
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(33, 37, 41);
  doc.text('Honorarabrechnung', 15, 20);

  // Invoice Information
  doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(99, 110, 114);
  doc.text(`Rechnung Nr.: ${invoice.invoiceId}`, 15, 28);
  doc.text(`Datum: ${invoiceDate}`, 15, 34);

  // Separation Line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(15, 40, 195, 40);

  // Teacher and Franchise Details
  const startY = 50;

  // Teacher Details
  doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor(33, 37, 41);
  doc.text('Lehrkraft Details', 15, startY);

  doc.setFontSize(12).setFont('helvetica', 'normal');
  doc.text(`Name: ${teacher.user.firstName} ${teacher.user.lastName}`, 15, startY + 6);
  doc.text(`Adresse: ${teacher.user.address}`, 15, startY + 12);
  doc.text(`Postleitzahl: ${teacher.user.postalCode}`, 15, startY + 18);
  doc.text(`Telefon: ${teacher.user.phoneNumber}`, 15, startY + 24);

  // Franchise Details
  doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor(33, 37, 41);
  doc.text('Franchise Details', 15, startY + 36);

  const franchise = teacher.locations[0]?.franchise || {};
  doc.setFontSize(12).setFont('helvetica', 'normal');
  doc.text(franchise.name || 'Franchise nicht verfügbar', 15, startY + 42);
  doc.text(franchise.address || 'Adresse nicht verfügbar', 15, startY + 48);
  doc.text(
    `${franchise.postalCode || ''} ${franchise.city || ''}`.trim(),
    15,
    startY + 54
  );

  // Invoice Information
  const invoiceInfoY = startY + 66;
  doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0, 102, 204);
  doc.text(`Honorarrechnung für ${teacher.user.firstName} ${teacher.user.lastName} (${monthYear})`, 15, invoiceInfoY);

  doc.setFontSize(12).setFont('helvetica', 'normal').setTextColor(33, 37, 41);
  doc.text('Sehr geehrte Damen und Herren,', 15, invoiceInfoY + 10);
  doc.text(
    `nachfolgend finden Sie die Abrechnung für den Unterricht, den ${teacher.user.firstName} ${teacher.user.lastName} im Monat ${monthYear} durchgeführt hat:`,
    15,
    invoiceInfoY + 16
  );

  // Table Section
  const tableColumns = ['Monat', 'Geleistete Stunden', 'Stundensatz (€)', 'Summe (€)'];
  const tableRows = [
    [
      monthYear,
      `${hoursWorked} hrs`,
      formatCurrency(teacher.hourlyRate),
      formatCurrency(invoice.totalAmount),
    ],
  ];

  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: invoiceInfoY + 30,
    styles: { halign: 'right', fontSize: 10 },
    headStyles: { fillColor: [230, 230, 230], textColor: 33 },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  // Payment Information
  const paymentInfoY = (doc).lastAutoTable.finalY + 10;
  doc.setFontSize(12).setFont('helvetica', 'normal').setTextColor(33, 37, 41);
  doc.text('Der Betrag wird innerhalb der nächsten 14 Tage auf das folgende Konto überwiesen:', 15, paymentInfoY);
  doc.text(`Kontoinhaber: ${teacher.user.firstName} ${teacher.user.lastName}`, 15, paymentInfoY + 6);
  doc.text(`IBAN: ${teacher.iban}`, 15, paymentInfoY + 12);
  doc.text(`Bankname: ${teacher.bank}`, 15, paymentInfoY + 18);

  // SEPA XML Generation
  const sepaDoc = new SEPA.Document('pain.001.001.09');

  // Group Header
  sepaDoc.grpHdr.id = `INV-${invoice.invoiceId}`;
  sepaDoc.grpHdr.created = new Date(invoice.createdAt);
  sepaDoc.grpHdr.initiatorName = franchise.name || 'Franchise Name';

  // Payment Information
  const paymentInfoSEPA = sepaDoc.createPaymentInfo();
  paymentInfoSEPA.requestedExecutionDate = new Date(invoice.createdAt);
  paymentInfoSEPA.debtorIBAN = franchise.iban;
  if (teacher.bic) {
    paymentInfoSEPA.debtorBIC = franchise.bic;
  }
  paymentInfoSEPA.debtorName = franchise.name;
  sepaDoc.addPaymentInfo(paymentInfoSEPA);

  // Transaction Details
  const transaction = paymentInfoSEPA.createTransaction();
  transaction.creditorName = `${teacher.user.firstName} ${teacher.user.lastName}`;
  transaction.creditorIBAN = teacher.iban;
  if (teacher.bic) {
    transaction.creditorBIC = teacher.bic;
  }
  transaction.amount = Number(invoice.totalAmount);
  transaction.remittanceInfo = `Rechnung ${invoice.invoiceId}`;
  transaction.end2endId = `INV-${invoice.invoiceId}`;
  paymentInfoSEPA.addTransaction(transaction);

  const sepaXML = sepaDoc.toString();

  // Footer Section
  const closingY = paymentInfoY + 30;
  doc.setFontSize(12).setFont('helvetica', 'italic').setTextColor(99, 110, 114);
  doc.text(
    '„Für weitere Fragen oder Anmerkungen stehen wir Ihnen gerne zur Verfügung.“',
    15,
    closingY,
    { maxWidth: 180 }
  );

  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(33, 37, 41);
  doc.text('Mit freundlichen Grüßen', 105, closingY + 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('- Empfehlen Sie uns an Ihre Freunde & Familie weiter -', 105, closingY + 26, { align: 'center' });

  // Convert PDF to Blob
  const pdfBlob = await doc.output('blob');

  // Convert SEPA XML to Blob
  const sepaBlob = new Blob([sepaXML], { type: 'application/xml' });

  return { pdf: pdfBlob, sepa: sepaBlob };
};

/**
 * Generates a ZIP file containing PDFs and SEPA XMLs for all invoices.
 *
 * @param {Array} invoices - The array of invoice data.
 * @returns {Promise<Blob>} - The generated ZIP file as a Blob.
 */

function transformInvoiceToTeacherData(invoice) {
  if (!invoice?.user?.teachers?.length) {
    throw new Error("Invalid invoice structure.");
  }

  const teacher = invoice.user.teachers[0];

  return {
    ...teacher,
    user: {
      ...invoice.user,
      id: teacher.user?.id || invoice.user.id,
    },
    locations: teacher.locations.map(location => ({
      id: location.id,
      franchise: location.franchise,
    })),
  };
}
export const generateBulkInvoicesZip = async (invoices) => {
  const zip = new JSZip();

  for (const invoice of invoices) {
    if (invoice.student) {
      // Parent Invoice
      const { pdf, sepa } = await generateParentInvoiceBlobs(invoice);
      zip.file(`Parent_Invoice_${invoice.invoiceId}.pdf`, pdf);
      zip.file(`Parent_SEPA_${invoice.invoiceId}.xml`, sepa);
    } else {
      // Teacher Invoice
      const { pdf, sepa } = await generateTeacherInvoiceBlobs(invoice, transformInvoiceToTeacherData(invoice));
      zip.file(`Teacher_Invoice_${invoice.invoiceId}.pdf`, pdf);
      zip.file(`Teacher_SEPA_${invoice.invoiceId}.xml`, sepa);
    }
  }

  // Generate the ZIP file as a Blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return zipBlob;
};

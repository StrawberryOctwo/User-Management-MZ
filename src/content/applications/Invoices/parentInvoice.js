import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SEPA from 'sepa';

/**
 * Generates a professional and polished PDF invoice for a parent, and creates a SEPA XML for direct debit.
 *
 * @param {Object} invoice - The invoice data.
 * @param {boolean} preview - If true, opens the PDF in a new tab for preview instead of downloading.
 */
const generateParentInvoicePDF = async (invoice, preview = false) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // Helper Functions
    const formatDate = (date) => new Date(date).toLocaleDateString('de-DE');
    const formatCurrency = (amount) => `€${Number(amount).toFixed(2)}`;
    const loadImage = (src) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });

    // Formatting details
    const invoiceDate = formatDate(invoice.createdAt);
    const monthYear = new Date(invoice.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
    const studentName = `${invoice.student.user.firstName} ${invoice.student.user.lastName}`;
    const parentName = `${invoice.user.firstName} ${invoice.user.lastName}`;
    const parentAccountHolder = invoice.student.parent.accountHolder;
    const parentAddress = invoice.user.address || 'N/A';
    const parentPostalCode = invoice.user.postalCode || 'N/A';
    const parentIban = invoice.student.parent.iban || 'N/A';
    const parentBic = invoice.student.parent.bic || null; // Null if not available
    const totalAmount = formatCurrency(invoice.totalAmount);
    const franchise = invoice.student.locations[0]?.franchise || {};
    const franchiseIban = franchise.iban;
    const franchiseBic = parentBic ? franchise.bic : null; // Skip BIC for both if parent's BIC is missing

    // Header Section: Invoice Info (Left) and Logo (Right)
    try {
        if (franchise.franchiseLogo) {
            const logo = await loadImage(franchise.franchiseLogo);
            doc.addImage(logo, 'PNG', 150, 10, 26, 26); // Logo sized to 128x128
        }
    } catch (error) {
        console.warn('Franchise logo could not be loaded:', error);
    }

    doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(33, 37, 41);
    doc.text('Rechnung', 15, 20); // Left-aligned title

    doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(99, 110, 114);
    doc.text(`Rechnung Nr.: ${invoice.invoiceId}`, 15, 28);
    doc.text(`Datum: ${invoiceDate}`, 15, 34);

    // Add a huge line for separation
    doc.setDrawColor(0); // Black color
    doc.setLineWidth(0.5); // Thick line
    doc.line(15, 40, 195, 40);

    // Parent and Franchise Details Section
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

    // Invoice Information Section
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

    // Payment Information Section
    const paymentInfoY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12).setFont('helvetica', 'normal').setTextColor(33, 37, 41);
    doc.text(`Der Betrag wird am ${invoiceDate} von Ihrem Konto abgebucht.`, 15, paymentInfoY);
    doc.text(`IBAN: ${parentIban}`, 15, paymentInfoY + 6);
    doc.text(
        'Hinweis: Bitte sorgen Sie für eine positive Kontodeckung. Wir berechnen zusätzliche Gebühren bei Rücklastschriften.',
        15,
        paymentInfoY + 12,
        { maxWidth: 180 }
    );

    // Direct Debit SEPA XML
    const sepaDoc = new SEPA.Document('pain.008.001.08');
    sepaDoc.grpHdr.id = `INV-${invoice.invoiceId}`;
    sepaDoc.grpHdr.created = new Date(invoice.createdAt);
    sepaDoc.grpHdr.initiatorName = franchise.name;

    const paymentInfo = sepaDoc.createPaymentInfo();
    paymentInfo.collectionDate = new Date(invoice.createdAt);
    paymentInfo.creditorIBAN = franchiseIban;
    if (parentBic) {
        paymentInfo.creditorBIC = franchiseBic;
    }
    paymentInfo.creditorName = franchise.name;
    sepaDoc.addPaymentInfo(paymentInfo);

    const transaction = paymentInfo.createTransaction();
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
    paymentInfo.addTransaction(transaction);

    const sepaXML = sepaDoc.toString();
    const downloadSEPA = () => {
        const blob = new Blob([sepaXML], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${parentName}-direct-debit-${invoice.invoiceId}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

    // Finalize PDF and SEPA XML
    if (preview) {
        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);
        window.open(pdfURL, '_blank');
    } else {
        doc.save(`${parentName}-invoice-${invoice.invoiceId}.pdf`);
        downloadSEPA();
    }
};

export default generateParentInvoicePDF;

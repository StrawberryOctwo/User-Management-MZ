import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SEPA from 'sepa';
/**
 * Generates a professional PDF invoice for a teacher and creates a SEPA XML for payment.
 *
 * @param {Object} invoice - The invoice data.
 * @param {Object} teacher - The teacher data.
 * @param {boolean} preview - If true, opens the PDF in a new tab for preview instead of downloading.
 */
const generateTeacherInvoicePDF = async (invoice, teacher, preview = false) => {
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
            img.crossOrigin = 'Anonymous'; // Handle cross-origin if needed
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });

    // Formatting details
    const invoiceDate = formatDate(invoice.createdAt);
    const monthYear = new Date(invoice.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
    const hoursWorked = (invoice.totalAmount / teacher.hourlyRate).toFixed(2);
    const currentDate = formatDate(new Date());

    // Header Section: Invoice Info (Left) and Logo (Right)
    try {
        if (teacher.locations[0].franchise.franchiseLogo) {
            const logo = await loadImage(teacher.locations[0].franchise.franchiseLogo);
            // Convert the image to a data URL
            const canvas = document.createElement('canvas');
            canvas.width = logo.width;
            canvas.height = logo.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(logo, 0, 0);
            const logoDataURL = canvas.toDataURL('image/png');
            doc.addImage(logoDataURL, 'PNG', 150, 10, 26, 26); // Logo sized 26x26
        }
    } catch (error) {
        console.warn('Teacher logo could not be loaded:', error);
    }

    // Title
    doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(33, 37, 41);
    doc.text('Honorarabrechnung', 15, 20); // Left-aligned title

    // Invoice Information
    doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(99, 110, 114);
    doc.text(`Rechnung Nr.: ${invoice.invoiceId}`, 15, 28);
    doc.text(`Datum: ${invoiceDate}`, 15, 34);

    // Separation Line
    doc.setDrawColor(0); // Black color
    doc.setLineWidth(0.5); // Line width
    doc.line(15, 40, 195, 40);

    // Teacher and Franchise Details Section
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

    // Invoice Information Section
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

    // Payment Information Section
    const paymentInfoY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12).setFont('helvetica', 'normal').setTextColor(33, 37, 41);
    doc.text('Der Betrag wird innerhalb der nächsten 14 Tage auf das folgende Konto überwiesen:', 15, paymentInfoY);
    doc.text(`Kontoinhaber: ${teacher.user.firstName} ${teacher.user.lastName}`, 15, paymentInfoY + 6);
    doc.text(`IBAN: ${teacher.iban}`, 15, paymentInfoY + 12);
    doc.text(`Bankname: ${teacher.bank}`, 15, paymentInfoY + 18);

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



    const sepaDoc = new SEPA.Document('pain.001.001.09');

    // Group Header
    sepaDoc.grpHdr.id = `INV-${invoice.invoiceId}`;
    sepaDoc.grpHdr.created = new Date(invoice.createdAt);
    sepaDoc.grpHdr.initiatorName = teacher.locations[0].franchise.name || 'Franchise Name';

// Payment Information
    const paymentInfo = sepaDoc.createPaymentInfo();
    paymentInfo.requestedExecutionDate = new Date(invoice.createdAt); // Execution date
    paymentInfo.debtorIBAN = teacher.locations[0].franchise.iban; // Franchise IBAN
    if (teacher.bic) {
        paymentInfo.debtorBIC = teacher.locations[0].franchise.bic; // Franchise BIC (optional)
    }
    paymentInfo.debtorName = teacher.locations[0].franchise.name; // Franchise Name
    sepaDoc.addPaymentInfo(paymentInfo);

    // Transaction Details
    const transaction = paymentInfo.createTransaction();
    transaction.creditorName = `${teacher.user.firstName} ${teacher.user.lastName}`;
    transaction.creditorIBAN = teacher.iban; // Teacher IBAN
    if (teacher.bic) {
        transaction.creditorBIC = teacher.bic; // Teacher BIC (optional)
    }
    transaction.amount = Number(invoice.totalAmount);
    transaction.remittanceInfo = `Rechnung ${invoice.invoiceId}`; // Payment Reference
    transaction.end2endId = `INV-${invoice.invoiceId}`; // Unique Transaction ID
    paymentInfo.addTransaction(transaction);


  // Convert SEPA XML to string
  const sepaXML = sepaDoc.toString();

  // Handle SEPA XML (e.g., download or send to server)
  const downloadSEPA = () => {
      const blob = new Blob([sepaXML], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sepa-invoice-${invoice.invoiceId}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Finalize PDF and SEPA XML
  if (preview) {
      // Preview PDF
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
      window.open(pdfURL, '_blank');
  } else {
      // Download PDF
      doc.save(`teacher-invoice-${invoice.invoiceId}.pdf`);

      // Download SEPA XML
      downloadSEPA();
  }
};

export default generateTeacherInvoicePDF;

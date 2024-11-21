import html2pdf from 'html2pdf.js';

const generateParentInvoicePDF = async (invoice, preview = false) => {
    const element = document.createElement('div');
    console.log(invoice);

    // Formatting details
    const invoiceDate = new Date(invoice.createdAt).toLocaleDateString('de-DE');
    const monthYear = new Date(invoice.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
    const studentName = `${invoice.student.user.firstName} ${invoice.student.user.lastName}`;
    const totalAmount = Number(invoice.totalAmount).toFixed(2);
    const parentName = `${invoice.user.firstName} ${invoice.user.lastName}`;
    const parentAddress = `${invoice.user.address}`;
    const parentPostalCode = `${invoice.user.postalCode}`;
    const parentIban = `${invoice.student.parent.iban}`; // Adjusted to match the invoice object

    // Helper function to calculate hours between start and end time
    const calculateSessionHours = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return ((endDate - startDate) / (1000 * 60 * 60)).toFixed(2); // Convert ms to hours
    };

    element.innerHTML = `
      <div style="font-family: 'Arial', sans-serif; padding: 20px; color: #333;">
        <!-- Header Section -->
        <header style="border-bottom: 2px solid #4CAF50; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="text-align: center; color: #4CAF50; margin: 0;">Rechnung</h1>
          <p style="text-align: right; margin: 5px 0; font-size: 14px;">
            <strong>Rechnung Nr.:</strong> ${invoice.invoiceId}
          </p>
        </header>

        <!-- Parent and Franchise Information -->
        <section style="display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap;">
          <!-- Parent Information -->
          <div style="flex: 1; min-width: 250px; margin-right: 20px;">
            <h2 style="font-size: 18px; margin-bottom: 10px; color: #555;">Eltern Details</h2>
            <p><strong>Name:</strong> ${parentName}</p>
            <p><strong>Adresse:</strong> ${parentAddress}</p>
            <p><strong>Postleitzahl:</strong> ${parentPostalCode}</p>
          </div>

          <!-- Franchise Information -->
          <div style="width: 300px; min-width: 250px;">
            <h2 style="font-size: 18px; margin-bottom: 10px; color: #555;">Franchise Details</h2>
            <p><strong>${invoice.student.locations[0].franchise.name}</strong></p>
            <p>${invoice.student.locations[0].franchise.address || 'Adresse nicht verfügbar'}</p>
            <p>${invoice.student.locations[0].franchise.postalCode || ''} ${invoice.student.locations[0].franchise.city || ''}</p>
          </div>
        </section>

        <!-- Date Section -->
        <div style="text-align: right; margin-bottom: 30px;">
          <p style="font-size: 14px;">den ${invoiceDate}</p>
        </div>

        <!-- Invoice Information -->
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; margin-bottom: 10px; color: #4CAF50;">Rechnung für ${studentName} (${monthYear})</h2>
          <p>Sehr geehrte Damen und Herren,</p>
          <p>hiermit stellen wir Ihnen für ${studentName} in dem Monat ${monthYear} folgende Rechnung:</p>
          <p><em>Umsatzsteuerfreie Leistung gemäß § 4 Nr. 21b UStG.</em></p>
        </section>

        <!-- Invoice Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px;">Datum</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Unterrichtstyp</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Dauer (Stunden)</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Betrag (€)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.payments
              .map(payment => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${new Date(payment.session.date).toLocaleDateString('de-DE')}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${payment.session.sessionType.name || 'Nicht definiert'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${payment.session.duration/60} hrs</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">€${Number(payment.amount).toFixed(2)}</td>
                </tr>
              `).join('')}
            <!-- Include one-time and monthly fees only if they are greater than 0 -->
            ${invoice.oneTimeFee > 0 ? `
              <tr>
                <td colspan="3" style="border: 1px solid #ddd; padding: 8px;">+ Materialkosten</td>
                <td style="border: 1px solid #ddd; padding: 8px;">€${Number(invoice.oneTimeFee).toFixed(2)}</td>
              </tr>
            ` : ''}
            ${invoice.monthlyFee > 0 ? `
              <tr>
                <td colspan="3" style="border: 1px solid #ddd; padding: 8px;">+ Monatsgebühr</td>
                <td style="border: 1px solid #ddd; padding: 8px;">€${Number(invoice.monthlyFee).toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr style="font-weight: bold;">
              <td colspan="3" style="border: 1px solid #ddd; padding: 8px;">Gesamtsumme</td>
              <td style="border: 1px solid #ddd; padding: 8px;">€${totalAmount}</td>
            </tr>
          </tbody>
        </table>

        <!-- Payment Information -->
        <section style="margin-top: 30px;">
          <p>Der Betrag wird am ${invoiceDate} von Ihrem Konto abgebucht.</p>
          <p><strong>IBAN:</strong> ${parentIban}</p>

          <p style="margin-top: 20px;">
            <strong>Hinweis:</strong> Bitte sorgen Sie für eine positive Kontodeckung, ansonsten entstehen uns hohe Gebühren, die wir Ihnen neu berechnen müssen. 
            Wir sind gezwungen, 10,00 € Bankgebühr und 5,00 € Bearbeitungsgebühren zusätzlich zu berechnen. 
            Der fällige Betrag wird am 10. des Monats nochmal abgebucht.
          </p>

          <p><em>„Für eine verbesserte Klausurvorbereitung möchten wir gerne mit den jeweiligen Fachlehrern in der Schule in Kontakt treten. 
          Wenn das erwünscht ist, melden Sie sich doch bitte bei uns.“</em></p>
        </section>

        <!-- Closing Section -->
        <div style="text-align: center; font-weight: bold; margin-top: 20px;">
          <p>Mit freundlichen Grüßen</p>
          <p>- Empfehlen Sie uns an Ihre Freunde & Familie weiter -</p>
        </div>

 
      </div>
    `;

    const options = {
        margin: 10,
        filename: `parent-invoice-${invoice.invoiceId}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    if (preview) {
        // Generate PDF as Blob to preview
        const pdfBlob = await html2pdf().set(options).from(element).outputPdf('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);
        
        // Open in a new tab for preview
        window.open(pdfURL, '_blank');
    } else {
        // Directly save the PDF if no preview is needed
        html2pdf().set(options).from(element).save()
            .then(() => console.log('Parent PDF generated!'))
            .catch((error) => console.error('Error generating PDF:', error));
    }
};

export default generateParentInvoicePDF;

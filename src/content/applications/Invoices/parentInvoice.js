import html2pdf from 'html2pdf.js';

const generateParentInvoicePDF = async (invoice, preview = false) => {
    const element = document.createElement('div');

    // Formatting details
    const invoiceDate = new Date(invoice.created_at).toLocaleDateString('de-DE');
    const monthYear = new Date(invoice.created_at).toLocaleString('default', { month: 'long', year: 'numeric' });
    const studentName = `${invoice.student.user.firstName} ${invoice.student.user.lastName}`;
    const totalAmount = Number(invoice.totalAmount).toFixed(2);
    const parentName = `${invoice.user.firstName} ${invoice.user.lastName}`;
    const parentAddress = `${invoice.user.address}`
    const parentPostalCode = `${invoice.user.postalCode}`
    const parentIban =  `${invoice.student.parent.iban}`

    // Helper function to calculate hours between start and end time
    const calculateSessionHours = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return ((endDate - startDate) / (1000 * 60 * 60)).toFixed(2); // Convert ms to hours
    };

    element.innerHTML = `
      <div style="font-family: 'Arial', sans-serif; padding: 20px;">
        <h1 style="text-align: center;">Rechnung</h1>
        
        <p><strong>${parentName}</strong></p>
        <p>${parentAddress}</p>

        
        <p style="text-align: right;">den ${invoiceDate}</p>
        <p><strong>Rechnung Nr.:</strong> ${invoice.invoiceId}</p>

        <p>Sehr geehrte Damen und Herren,</p>
        <p>hiermit stellen wir Ihnen für ${studentName} in dem Monat ${monthYear} folgende Rechnung:</p>
        <p><em>Umsatzsteuerfreie Leistung gemäß § 4 Nr. 21b UStG.</em></p>

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
                  <td style="border: 1px solid #ddd; padding: 8px;">${new Date(payment.session.sessionStartDate).toLocaleDateString('de-DE')}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${payment.session.sessionType}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${calculateSessionHours(payment.session.sessionStartDate, payment.session.sessionEndDate)} hrs</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">€${Number(payment.amount).toFixed(2)}</td>
                </tr>
              `).join('')}
            <tr>
              <td colspan="3" style="border: 1px solid #ddd; padding: 8px;">+ Monatsbericht</td>
              <td style="border: 1px solid #ddd; padding: 8px;">€${invoice.extraAmount}</td>
            </tr>
            <tr>
              <td colspan="3" style="border: 1px solid #ddd; padding: 8px;">+ Materialkosten</td>
              <td style="border: 1px solid #ddd; padding: 8px;">€${invoice.extraAmount}</td>
            </tr>
            <tr style="font-weight: bold;">
              <td colspan="3" style="border: 1px solid #ddd; padding: 8px;">Gesamtsumme</td>
              <td style="border: 1px solid #ddd; padding: 8px;">€${totalAmount}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin-top: 20px;">Der Betrag wird am ${invoiceDate} von Ihrem Konto abgehoben.</p>
        <p>Unsere Gläubiger-ID lautet: ${parentIban}</p>
        
        <p style="margin-top: 20px;">
          <strong>Hinweis:</strong> Bitte sorgen Sie für eine positive Kontodeckung, ansonsten entstehen uns hohe Gebühren, die wir Ihnen neu berechnen müssen. 
          Wir sind gezwungen 10,00 € Bankgebühr und 5,00 € Bearbeitungsgebühren zusätzlich zu berechnen. 
          Der fällige Betrag wird am 10. des Monats nochmal abgebucht.
        </p>

        <p><em>„Für eine verbesserte Klausurvorbereitung möchten wir gerne mit den jeweiligen Fachlehrern in der Schule in Kontakt treten. 
        Wenn das erwünscht ist, melden Sie sich doch bitte bei uns“</em></p>

        <p style="text-align: center; font-weight: bold;">Mit freundlichen Grüßen</p>
        <p style="text-align: center;">- Empfehlen Sie uns an Ihre Freunde & Familie weiter -</p>

        <footer style="font-size: 0.9em; color: #666; text-align: center; margin-top: 30px;">
          Lernförderung OWL | Geschäftsführer: Bold Molor | Steuernummer: 349/5218/3982 <br>
          Adresse: Bahnhofstraße 6, 33602 Bielefeld | Tel.: 0176 / 214 96 747 | E-mail: kontakt@lernfoerderung-owl.de
        </footer>
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

import html2pdf from 'html2pdf.js';

const generateTeacherInvoicePDF = async (invoice, teacher, preview = false) => {
    const element = document.createElement('div');

    // Calculate total hours worked based on invoice data
    const hoursWorked = (invoice.totalAmount / teacher.hourlyRate).toFixed(2);
    const invoiceDate = new Date(invoice.createdAt);
    const month = invoiceDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentDate = new Date().toLocaleDateString();

    element.innerHTML = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333;">
        <!-- Header Section -->
        <header style="border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="text-align: center; color: #4CAF50; margin: 0;">Honorarabrechnung Vorlage</h1>
          <p style="text-align: right; margin: 5px 0; font-size: 14px;">
            <strong>Steuernummer:</strong> ${teacher.taxNumber}
          </p>
        </header>

        <!-- Teacher and Franchise Information -->
        <section style="width: 100%; display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap;">
          <!-- Teacher Information -->
          <div style="flex: 1; min-width: 250px; margin-right: 20px;">
            <h2 style="font-size: 18px; margin-bottom: 10px; color: #555;">Lehrkraft Details</h2>
            <p><strong>Name:</strong> ${teacher.user.firstName} ${teacher.user.lastName}</p>
            <p><strong>Adresse:</strong> ${teacher.user.address}</p>
            <p><strong>Postleitzahl:</strong> ${teacher.user.postalCode}</p>
            <p><strong>Telefon:</strong> ${teacher.user.phoneNumber}</p>
          </div>

          <!-- Franchise Information -->
          <div style="width: 300px; min-width: 250px;">
            <h2 style="font-size: 18px; margin-bottom: 10px; color: #555;">Franchise Details</h2>
            <p><strong>${teacher.locations[0].franchise.name}</strong></p>
            <p>${teacher.locations[0].franchise.address}</p>
            <p>${teacher.locations[0].franchise.postalCode} ${teacher.locations[0].franchise.city}</p>
          </div>
        </section>

        <!-- Date Section -->
        <div style="text-align: right; margin-bottom: 30px;">
          <p style="font-size: 14px;">${teacher.user.city}, den ${currentDate}</p>
        </div>

        <!-- Invoice Information -->
        <section style="margin-bottom: 20px;">
          <h2 style="font-size: 16px; margin-bottom: 10px; color: #4CAF50;">Honorarrechnung Nr. ${invoice.invoiceId}</h2>
          <p>Sehr geehrte Damen und Herren,</p>
          <p>Nachfolgend finden Sie die Abrechnung für den Unterricht, den ${teacher.user.firstName} ${teacher.user.lastName} im Monat ${month} durchgeführt hat.</p>
        </section>

        <!-- Invoice Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Monat</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Geleistete Stunden</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Stundensatz (60min)</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Summe (€)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #fff;">
              <td style="border: 1px solid #ddd; padding: 10px;">${month}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${hoursWorked} hrs</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">€${teacher.hourlyRate}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">€${invoice.totalAmount}</td>
            </tr>
          </tbody>
        </table>

        <!-- Payment Information -->
        <section style="margin-top: 30px;">
          <p>Der Betrag wird innerhalb der nächsten 14 Tage auf das folgende Konto überwiesen:</p>
          <p><strong>Kontoinhaber:</strong> ${teacher.user.firstName} ${teacher.user.lastName}</p>
          <p><strong>IBAN:</strong> ${teacher.iban}</p>
          <p><strong>Bankname:</strong> ${teacher.bank}</p>
        </section>

        <!-- Closing Section -->
        <footer style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px;">
          <p>Mit freundlichen Grüßen,</p>
          <p><strong>${teacher.locations[0].franchise.name}</strong></p>
          <p>${teacher.user.firstName} ${teacher.user.lastName}</p>
        </footer>
      </div>
    `;

    const options = {
        margin: 15,
        filename: `teacher-invoice-${invoice.invoiceId}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    if (preview) {
        try {
            // Generate PDF as Blob to preview
            const pdfBlob = await html2pdf().set(options).from(element).outputPdf('blob');
            const pdfURL = URL.createObjectURL(pdfBlob);
            
            // Open in a new tab for preview
            window.open(pdfURL, '_blank');
        } catch (error) {
            console.error('Error generating PDF preview:', error);
        }
    } else {
        // Directly save the PDF if no preview is needed
        html2pdf().set(options).from(element).save()
            .then(() => console.log('Teacher PDF generated!'))
            .catch((error) => console.error('Error generating PDF:', error));
    }
};

export default generateTeacherInvoicePDF;

import html2pdf from 'html2pdf.js';


const generateTeacherInvoicePDF = async (invoice, teacher, preview = false) => {
    const element = document.createElement('div');

    // Calculate total hours worked based on invoice data
    const hoursWorked = (invoice.totalAmount / teacher.hourlyRate).toFixed(2);
    const invoiceDate = new Date(invoice.createdAt);
    const month = invoiceDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    element.innerHTML = `
      <div style="font-family: 'Arial', sans-serif; padding: 20px;">
        <h1 style="text-align: center;">Honorarabrechnung Vorlage</h1>
        
        <p style="text-align: right;">
          Steuernummer: ${teacher.taxNumber}
        </p>
        
        <p><strong>Name:</strong> ${teacher.user.firstName} ${teacher.user.lastName}</p>
        <p><strong>Address:</strong> ${teacher.user.address}</p>
        <p><strong>Postal Code:</strong> ${teacher.user.postalCode}</p>
        <p><strong>Phone:</strong> ${teacher.user.phoneNumber}</p>
        
        <h3>Lernförderung OWL</h3>
        <p>Bahnhofstraße 6</p>
        <p>33602 Bielefeld</p>
        
        <p style="text-align: right;"> den ${new Date().toLocaleDateString()}</p>

        <h3>Honorarrechnung Nr. ${invoice.invoiceId}</h3>
        <p>Sehr geehrte Damen und Herren,</p>
        <p>Nachfolgend finden Sie die Abrechnung für den Unterricht, den ${teacher.user.firstName} ${teacher.user.lastName} im Monat ${month} durchgeführt hat.</p>
  
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px;">Monat</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Geleistete Stunden</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Stundensatz pro 60min</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Summe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${month}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${hoursWorked} hrs</td>
              <td style="border: 1px solid #ddd; padding: 8px;">€${teacher.hourlyRate}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">€${invoice.totalAmount}</td>
            </tr>
          </tbody>
        </table>
  
        <p style="margin-top: 20px;">
          Der Betrag wird innerhalb der nächsten 14 Tage auf das folgende Konto überwiesen:
        </p>
        <p><strong>Kontoinhaber:</strong> ${teacher.user.firstName} ${teacher.user.lastName}</p>
        <p><strong>IBAN:</strong> ${teacher.iban}</p>
        <p><strong>Bankname:</strong> ${teacher.bank}</p>
  
        <p>Mit freundlichen Grüßen,</p>
        <p>Lernförderung OWL</p>
        <p>${teacher.user.firstName} ${teacher.user.lastName}</p>
      </div>
    `;

    const options = {
        margin: 10,
        filename: `teacher-invoice-${invoice.invoiceId}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    if (preview) {
        // Generate PDF as Blob to preview
        const pdfBlob = await html2pdf().set(options).from(element).outputPdf('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);
        
        // Open in a new tab or show in an iframe for preview
        window.open(pdfURL, '_blank');
    } else {
        // Directly save the PDF if no preview is needed
        html2pdf().set(options).from(element).save()
            .then(() => console.log('Teacher PDF generated!'))
            .catch((error) => console.error('Error generating PDF:', error));
    }
};

export default generateTeacherInvoicePDF;

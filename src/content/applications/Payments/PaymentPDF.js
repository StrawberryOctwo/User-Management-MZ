import html2pdf from 'html2pdf.js';

const generatePDF = (payment) => {
    const element = document.createElement('div');

    element.innerHTML = `
      <div style="font-family: 'Arial', sans-serif; padding: 20px;">
        <h1 style="text-align: center;">Honorarabrechnung Vorlage</h1>
        <p><strong>Name:</strong> ${payment.user.firstName} ${payment.user.lastName}</p>
        <p><strong>Address:</strong> ${payment.user.address}</p>
        <p><strong>Postal Code:</strong> ${payment.user.postalCode}</p>
        <p><strong>Phone:</strong> ${payment.user.phoneNumber}</p>
        
        <h3>Lernförderung OWL</h3>
        <p>Bahnhofstraße 6</p>
  
        <div style="display: flex; justify-content: space-between;">
          <p>33602 Bielefeld</p>
          <p>Berlin, den ${new Date().toLocaleDateString()}</p>
        </div>
  
        <h3>Honorarrechnung Nr. HZ-2024-1027-001</h3>
        <p>Sehr geehrte Damen und Herren,</p>
        <p>Hiermit stelle ich Ihnen folgende Rechnung:</p>
  
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
              <td style="border: 1px solid #ddd; padding: 8px;">February</td>
              <td style="border: 1px solid #ddd; padding: 8px;">14hrs 15mins</td>
              <td style="border: 1px solid #ddd; padding: 8px;">€15</td>
              <td style="border: 1px solid #ddd; padding: 8px;">€135.78</td>
            </tr>
          </tbody>
        </table>
  
        <p style="margin-top: 20px;">
          Bitte überweisen Sie mir die Summe innerhalb der nächsten 14 Tage auf das folgende Konto:
        </p>
        <p><strong>Name des Kontoinhabers:</strong> ${payment.user.firstName} ${payment.user.lastName}</p>
        <p><strong>IBAN:</strong> ${payment.teacher.iban}</p>
  
        <p>Mit freundlichen Grüßen,</p>
        <p>Automatically Signature</p>
        <p>${payment.user.firstName} ${payment.user.lastName}</p>
      </div>
    `;

    // Use html2pdf to generate and open the PDF
    html2pdf()
        .set({
            margin: 10,
            filename: `payment-${payment.id}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save()
        .then(() => {
            console.log('PDF generated!');
        })
        .catch((error) => {
            console.error('Error generating PDF:', error);
        });
};

export default generatePDF;

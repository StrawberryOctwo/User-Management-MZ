import PDFDocument from 'pdfkit';
import { Billing } from '../entities/billing.entity';


function formatDateGerman(date: Date): string {
  return date.toLocaleDateString('de-DE');
}

export function generateBillingPDF(billing: Billing) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  
  doc.font('Helvetica-Bold').fontSize(24).text("Your Company Name", { align: "center" });
  
  
  doc.font('Helvetica').fontSize(10).text("1234 Street Address, City, Country", { align: "center" });
  doc.text("Phone: 123-456-7890 | Email: billing@yourcompany.com", { align: "center" });
  
  doc.moveDown(2); 
  
  
  doc.font('Helvetica-Bold').fontSize(18).text("Invoice", { align: "center", underline: true });
  doc.moveDown(1);
  
  
  doc.font('Helvetica').fontSize(12)
    .text(`Invoice Date: ${formatDateGerman(billing.billingDate)}`, { align: "right" })
    .text(`Due Date: ${formatDateGerman(new Date(billing.billingDate.getTime() + 30 * 24 * 60 * 60 * 1000))}`, { align: "right" });
  doc.moveDown(2);

  
  doc.font('Helvetica-Bold').fontSize(14).text("Bill To:", { underline: true, align: "left" }).moveDown(1);
  doc.font('Helvetica').fontSize(12)
    .text(`Franchise: ${billing.franchise.name}`, { align: "left" })
    .text(`Owner: ${billing.franchise.ownerName}`, { align: "left" })
    .text(`Account Holder: ${billing.franchise.cardHolderName}`, { align: "left" })
    .text(`IBAN: ${billing.franchise.iban}`, { align: "left" })
    .text(`BIC: ${billing.franchise.bic}`, { align: "left" });
  
  doc.moveDown(1.5); 

 
doc.font('Helvetica-Bold').fontSize(14).text("Billing Summary", { underline: true, align: "left" }).moveDown(0.5);


doc.font('Helvetica').fontSize(12);
const tableTop = doc.y;


doc.font('Helvetica-Bold').text("Revenue", 50, tableTop, { align: "left" });
doc.font('Helvetica').text(`€ ${billing.revenue}`, 450, tableTop, { align: "right" });
doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke(); 


doc.moveDown(0.5);
doc.font('Helvetica-Bold').text("Percentage", 50, tableTop + 30, { align: "left" });
doc.font('Helvetica').text(`${billing.franchise.percentage}%`, 450, tableTop + 30, { align: "right" });
doc.moveTo(50, tableTop + 45).lineTo(550, tableTop + 45).stroke(); 


doc.moveDown(0.5);
doc.font('Helvetica-Bold').text("Amount Due", 50, tableTop + 60, { align: "left" });
doc.font('Helvetica').text(`€ ${billing.amountDue}`, 450, tableTop + 60, { align: "right" });



const stampPositionY = doc.page.height - 150; 
doc.font('Helvetica-Bold').fontSize(30); 

if (!billing.isPaid) {
  doc.fillColor('red').text("PENDING", 50, stampPositionY, { align: 'center' }).fillColor('black'); 
} else {
  doc.fillColor('green').text("PAID", 50, stampPositionY, { align: 'center' }).fillColor('black'); 
}


doc.font('Helvetica').fontSize(12); 

doc.moveDown(2); 



const footerY = doc.page.height - 100; 
doc.text("If you have any questions about this invoice, please contact us:", 50, footerY, { align: "center", width: doc.page.width - 100 });
doc.text("Email: billing@yourcompany.com | Phone: 123-456-7890", 50, footerY + 15, { align: "center", width: doc.page.width - 100 });


const bufferPromise = new Promise((resolve, reject) => {
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => resolve(Buffer.concat(buffers)));
  doc.end();
});

return bufferPromise;

}


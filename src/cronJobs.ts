import cron from 'node-cron';
import { InvoiceService } from './utils/cronJobFunction';

// Schedule job for the 1st of every month
cron.schedule('0 0 1 * *', async () => {
  console.log('Running invoice generation for the 1st...');
  await InvoiceService.generateInvoicesForDay(1);
});

// Schedule job for the 15th of every month
cron.schedule('0 0 15 * *', async () => {
  console.log('Running invoice generation for the 15th...');
  await InvoiceService.generateInvoicesForDay(15);
});

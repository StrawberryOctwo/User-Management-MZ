import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Billing } from '../entities/billing.entity';
import { Franchise } from '../entities/franchise.entity';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { generateBillingPDF } from '../utils/generatePdf'
const cron = require('node-cron');

class BillingController {

  
  
  
  
  
  
  
  

  
  static async getAllBillings(req: AuthenticatedRequest, res: Response) {
    try {
      const billingRepo = AppDataSource.getRepository(Billing);

      
      const { page = 1, limit = 10, searchQuery } = req.query;
      const take = Number(limit);
      const skip = (Number(page) - 1) * take;

      
      let queryBuilder = billingRepo.createQueryBuilder('billing')
        .leftJoin('billing.franchise', 'franchise')
        .addSelect(['franchise.name'])
        .orderBy('billing.billingDate', 'DESC')
        .skip(skip)
        .take(take);


      
      if (searchQuery) {
        queryBuilder.andWhere(
          `billing.id LIKE :search OR 
               billing.revenue LIKE :search OR 
               billing.amountDue LIKE :search OR 
               billing.billingDate LIKE :search`,
          { search: `%${searchQuery}%` }
        );
      }
      if (req.queryFilters) {
        queryBuilder = req.queryFilters(queryBuilder);
      }
      
      const [billings, total] = await queryBuilder.getManyAndCount();

      
      return res.status(200).json({
        data: billings,
        total, 
        currentPage: Number(page),
        pageSize: Number(limit),
      });
    } catch (error) {
      console.error('Error fetching billings:', error);
      return res.status(500).json({ message: 'Error fetching billings' });
    }
  }


  
  static async submitBilling(req: AuthenticatedRequest, res: Response) {
    const { franchiseId, revenue } = req.body;

    try {
      const franchiseRepo = AppDataSource.getRepository(Franchise);
      const billingRepo = AppDataSource.getRepository(Billing);

      const franchise = await franchiseRepo.findOne({ where: { id: franchiseId } });

      if (!franchise) {
        return res.status(404).json({ message: 'Franchise not found' });
      }

      const amountDue = revenue * (franchise.percentage / 100);

      const billing = billingRepo.create({
        revenue,
        amountDue,
        isPaid: false, 
        franchise,
        billingDate: new Date(),
      });

      await billingRepo.save(billing);
      return res.status(201).json({ message: 'Billing submitted successfully' });

    } catch (error) {
      console.error('Error submitting billing:', error);
      return res.status(500).json({ message: 'Error submitting billing' });
    }
  }


  
  static async confirmBillingAsPaid(req: AuthenticatedRequest, res: Response) {
    const { billingId, isPaid } = req.body;

    try {
      const billingRepo = AppDataSource.getRepository(Billing);

      const billing = await billingRepo.findOne({ where: { id: billingId }, relations: ['franchise'] });

      if (!billing) {
        return res.status(404).json({ message: 'Billing not found' });
      }

      billing.isPaid = isPaid;
      billing.paymentDate = new Date();

      await billingRepo.save(billing);
      const statusMessage = isPaid ? 'Paid' : 'Unpaid';
      return res.status(200).json({ message: `Billing payment set to ${statusMessage}` });

    } catch (error) {
      console.error('Error confirming billing as paid:', error);
      return res.status(500).json({ message: 'Error confirming billing as paid' });
    }
  }

  
  static async getBillingsForFranchise(req: AuthenticatedRequest, res: Response) {
    const { franchiseId } = req.params;

    try {
      const billingRepo = AppDataSource.getRepository(Billing);

      const billings = await billingRepo.find({ where: { franchise: { id: Number(franchiseId) } }, order: { billingDate: 'DESC' } });

      return res.status(200).json(billings);

    } catch (error) {
      console.error('Error fetching billings for franchise:', error);
      return res.status(500).json({ message: 'Error fetching billings for franchise' });
    }
  }

  
  static async getBillingById(req: AuthenticatedRequest, res: Response) {
    const { billingId } = req.params;

    try {
      const billingRepo = AppDataSource.getRepository(Billing);

      const billing = await billingRepo.findOne({ where: { id: Number(billingId) }, relations: ['franchise'] });

      if (!billing) {
        return res.status(404).json({ message: 'Billing not found' });
      }

      return res.status(200).json(billing);

    } catch (error) {
      console.error('Error fetching billing:', error);
      return res.status(500).json({ message: 'Error fetching billing' });
    }
  }

  
  static async downloadBillingInvoice(req: AuthenticatedRequest, res: Response) {
    const { billingId } = req.params;

    try {
      const billingRepo = AppDataSource.getRepository(Billing);

      const billing = await billingRepo.findOne({ where: { id: Number(billingId) }, relations: ['franchise'] });

      if (!billing) {
        return res.status(404).json({ message: 'Billing not found' });
      }

      
      const pdfBuffer = await generateBillingPDF(billing); 

      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=billing-${billingId}.pdf`);
      return res.send(pdfBuffer);

    } catch (error) {
      console.error('Error downloading billing invoice:', error);
      return res.status(500).json({ message: 'Error downloading billing invoice' });
    }
  }
}

export default BillingController;



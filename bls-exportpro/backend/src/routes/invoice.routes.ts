import { Router } from 'express';
import * as invoiceController from '../controllers/invoice.controller';
import * as pdfController from '../controllers/pdf.controller';
import { validate } from '../middleware/validate.middleware';
import {
  generateInvoiceSchema,
  getInvoiceSchema,
  listInvoicesSchema,
  updateInvoiceSchema,
  importInvoicesSchema,
} from '../schemas/invoice.schema';
import { generateInvoiceImportTemplate } from '../utils/excel-template-generator';

const router = Router();

router.post(
  '/generate',
  validate(generateInvoiceSchema),
  invoiceController.generateInvoice
);

router.post(
  '/import',
  validate(importInvoicesSchema),
  invoiceController.importInvoices
);

router.get(
  '/import/template',
  (req, res) => {
    try {
      const buffer = generateInvoiceImportTemplate();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="invoice-import-template.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error('Error generating template:', error);
      res.status(500).json({ error: 'Failed to generate template' });
    }
  }
);

router.get(
  '/',
  validate(listInvoicesSchema),
  invoiceController.listInvoices
);

router.get(
  '/:id',
  validate(getInvoiceSchema),
  invoiceController.getInvoice
);

router.get(
  '/:id/pdf',
  validate(getInvoiceSchema),
  pdfController.generateInvoicePDF
);

router.put(
  '/:id',
  validate(updateInvoiceSchema),
  invoiceController.updateInvoice
);

router.delete(
  '/:id',
  validate(getInvoiceSchema),
  invoiceController.deleteInvoice
);

export default router;
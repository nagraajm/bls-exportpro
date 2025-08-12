import { Router } from 'express';
import * as invoiceController from '../controllers/invoice.controller';
import * as pdfController from '../controllers/pdf.controller';
import { validate } from '../middleware/validate.middleware';
import {
  generateInvoiceSchema,
  getInvoiceSchema,
  listInvoicesSchema,
  updateInvoiceSchema,
} from '../schemas/invoice.schema';

const router = Router();

router.post(
  '/generate',
  validate(generateInvoiceSchema),
  invoiceController.generateInvoice
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
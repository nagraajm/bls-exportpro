import { Router } from 'express';
import * as documentController from '../controllers/document.controller';

const router = Router();

// Invoice document generation
router.post('/invoice/:id/generate', documentController.generateInvoiceDocuments);
router.get('/invoice/:id/pdf', documentController.generateInvoicePDF); // Legacy

// Packing list document generation
router.post('/packing-list/:id/generate', documentController.generatePackingListDocuments);

// Purchase order document generation
router.post('/purchase-order/:id/generate', documentController.generatePurchaseOrderDocuments);

// Bulk generation
router.post('/bulk/invoices', documentController.generateBulkInvoices);

// Document versioning
router.get('/versions/:type/:documentNumber', documentController.getDocumentVersions);

export default router;